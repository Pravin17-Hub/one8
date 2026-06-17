import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const isConfigured = !!(
  process.env.EMAIL_HOST &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  !process.env.EMAIL_USER.includes('your_gmail_address') &&
  !process.env.EMAIL_PASS.includes('your_gmail_app_password')
);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '',
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : '',
      },
      connectionTimeout: 5000, // 5 seconds connection timeout
      socketTimeout: 5000,     // 5 seconds socket inactivity timeout
    })
  : null;

export const sendOtpEmail = async (toEmail, code) => {
  if (!transporter) {
    console.warn(`[SMTP Warning] SMTP credentials are not configured. Verification code for ${toEmail} is logged in console: ${code}`);
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"One8 AI Marketplace" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify Your Email Address - One8 AI Marketplace',
    html: `
      <div style="font-family: 'Inter', sans-serif; background-color: #f9fafb; padding: 40px; color: #111827;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid rgba(0, 0, 0, 0.05); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em;">One8 <span style="color: #f59e0b;">AI</span></h1>
            <p style="font-size: 14px; color: #4b5563; margin-top: 5px;">Luxury Intelligence Commerce</p>
          </div>
          
          <div style="border-t: 1px solid #e5e7eb; padding-top: 30px; margin-top: 10px;">
            <p style="font-size: 16px; line-height: 1.6; color: #334155;">Hello,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #334155;">Thank you for registering at One8 Marketplace. To complete your account creation and verify your email, please use the following 6-digit verification code:</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <span style="display: inline-block; font-size: 38px; font-weight: 800; letter-spacing: 0.25em; color: #0f172a; background: #f3f4f6; padding: 15px 30px; border-radius: 16px; border: 1px solid #e5e7eb;">
                ${code}
              </span>
            </div>
            
            <p style="font-size: 14px; line-height: 1.5; color: #6b7280; font-style: italic;">Note: This verification code is valid for 5 minutes. Do not share this code with anyone.</p>
          </div>
          
          <div style="border-t: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
            <p>© 2026 One8 AI Marketplace. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Verification email sent to ${toEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[SMTP Error] Failed to send email to ${toEmail}:`, error.message);
    return false;
  }
};
