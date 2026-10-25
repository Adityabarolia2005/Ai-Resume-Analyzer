import crypto from "node:crypto";
import "dotenv/config";
import { User } from "../models/user.model.js";
import { ApiError } from "../utility/apiError.js";
import { sendPasswordResetEmail } from "./email.service.js";

export async function requestPasswordReset(email) {
    const user = await User.findOne({ email });

    // Do not reveal whether an email exists to the caller.
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail({ email: user.email, resetUrl });
}

export async function resetPassword(rawToken, newPassword) {
    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
        throw new ApiError(400, "Password reset token is invalid or expired");
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save();
}
