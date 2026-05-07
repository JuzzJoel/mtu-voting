import nodemailer from "nodemailer";
import { env } from "@/lib/env";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendOtpEmail(email: string, otp: string) {
  const info = await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Your MTU Voting Portal Code",
    text: `Your one-time code is: ${otp}\n\nIt expires in 10 minutes. Do not share it with anyone.\n\n— MTU Electoral Committee`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e5e7eb;">
        <div style="background: #000; padding: 20px 28px;">
          <p style="color: #fff; font-size: 13px; font-weight: 700; margin: 0; letter-spacing: 0.05em;">MTU VOTING PORTAL</p>
        </div>
        <div style="padding: 32px 28px; background: #fff;">
          <p style="font-size: 14px; color: #374151; margin: 0 0 20px;">Your one-time verification code is:</p>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; text-align: center; margin: 0 0 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #000;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="font-size: 13px; color: #6b7280; margin: 0;">Do not share this code with anyone.</p>
        </div>
        <div style="padding: 16px 28px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">Mountain Top University — Student Choice Awards 2026</p>
        </div>
      </div>
    `,
  });
  console.log(`[mail] OTP sent to ${email} — messageId: ${info.messageId}`);
}
