import nodemailer from "nodemailer";
import { env } from "@/lib/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
});

export async function sendOtpEmail(email: string, otp: string) {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Authentication Code - Mountain Top University Voting Portal",
    text: `Dear Student,\n\nYour one-time authentication code for the Mountain Top University Voting Portal is: ${otp}\n\nThis code will expire in 10 minutes. For security reasons, please do not share this code with anyone.\n\nBest regards,\nMTU Electoral Committee`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1A1025; padding: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0;">MTU Voting Portal</h2>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333333; margin-top: 0;">Dear Student/Staff,</p>
          <p style="font-size: 16px; color: #333333;">Your one-time authentication code for the Mountain Top University Voting Portal is:</p>
          <div style="background-color: #f4f4f4; border-radius: 6px; padding: 15px; text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4A3E59;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666666;">This code will expire in <strong>10 minutes</strong>. For security reasons, please do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999999; text-align: center; margin: 0;">Best regards,<br/><strong>MTU Electoral Committee</strong></p>
        </div>
      </div>
    `
  });
}
