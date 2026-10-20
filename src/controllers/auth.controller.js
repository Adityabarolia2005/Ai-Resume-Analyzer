import {User} from "../models/user.model.js";
import {ApiError} from "../utility/apiError.js";
import {ApiResponse} from "../utility/response.js";
import jwt from "jsonwebtoken"
import crypto from "node:crypto";
import { sendVerificationEmail } from "../services/email.service.js";
import "dotenv/config"

export const registerUser = async function (req, res, next) {
    const { password, email, userName } = req.body;
    if (!password || !email || !userName) {
        return next(new ApiError(400, "Validation error in the request body"));
    }
    //check the existence of the user in before
    let existingUser;
    try {
        existingUser = await User.findOne({
            $or: [{ email }, { userName }]
        });
    } catch (error) {
        return next(error);
    }

    if (existingUser) {
        return next(new ApiError(409, "Email or username already exists"));
    }

    //wee dont need to determine the error's of the mondodb data base it itself determines the object 

    try {
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const hashedVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        const userData = await User.create({
            userName,
            email,
            password,
            globalRole: "member",
            emailVerificationToken: hashedVerificationToken,
            emailVerificationTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
        });

        const verificationUrl = `${process.env.BACKEND_URL || "http://localhost:8000/api/v1/auth/verify-email"}?token=${verificationToken}`;
        await sendVerificationEmail({ email, verificationUrl });

        const safeUser = {
            id: userData._id,
            userName: userData.userName,
            email: userData.email,
            globalRole: userData.globalRole,
        };

        return res.status(201).json(
            new ApiResponse(
                201,
                "The registration has been successfully completed",
                { ...safeUser, emailVerificationRequired: true }
            )
        );
    } catch (error) {
        return next(error);
    }

};

export const verifyEmail = async function (req, res, next) {
    try {
        const { token } = req.query;

        if (!token) {
            return next(new ApiError(400, "Verification token is required"));
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationTokenExpiry: { $gt: new Date() },
        });

        if (!user) {
            return next(new ApiError(400, "Verification token is invalid or expired"));
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpiry = undefined;
        await user.save();

        return res.status(200).json(
            new ApiResponse(200, "Email verified successfully")
        );
    } catch (error) {
        return next(error);
    }
};


export const loginUser = async function (req, res, next) {
    try {
    const { password, email } = req.body;
    if (!email || !password) {
        return next(new ApiError(400, "Email and password are required"));
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.isPasswordCorrect(password))) {
        return next(new ApiError(401, "Invalid email or password"));
    }

    if (!user.isEmailVerified) {
        return next(new ApiError(403, "Please verify your email before logging in"));
    }

    const accessToken = jwt.sign(
        {
            id: user._id.toString(),
            email: user.email,
            globalRole: user.globalRole,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    const safeUser = {
        id: user._id,
        userName: user.userName,
        email: user.email,
        globalRole: user.globalRole,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/",
        })
        .json(new ApiResponse(200, "User signed in successfully", safeUser));
    } catch (error) {
        return next(error);
    }
};

export const logOutUser = function(req , res , next){
    try{
        return res.clearCookie("accessToken" , {
            httpOnly: true,
            path:"/",
            secure:process.env.CURREN_ENV === "production",
            sameSite:"lax",
        })
        .json({
        success: true,
        message: "User logged out successfully",
      });
  } catch (error) {
    return next(error);
  }
};
    
