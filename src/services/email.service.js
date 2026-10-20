import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
});

export async function sendVerificationEmail({ email, verificationUrl }) {

    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: "Verify your email",
        html: `
      <h2>Verify your email address</h2>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 15 minutes.</p>
    `
    })
    
}