import dotenv from 'dotenv';

dotenv.config();

export const isConfigured = !!(
  (process.env.BREVO_API_KEY && !process.env.BREVO_API_KEY.includes('your_brevo_api_key')) ||
  (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your_resend_api_key'))
);

export const sendOtpEmail = async (toEmail, code) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (brevoApiKey && !brevoApiKey.includes('your_brevo_api_key')) {
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey.trim(),
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'One8 AI Marketplace',
            email: fromEmail
          },
          to: [
            {
              email: toEmail
            }
          ],
          subject: 'Verify Your Email Address - One8 AI Marketplace',
          htmlContent: `
            <div style="font-family: 'Inter', sans-serif; background-color: #f9fafb; padding: 40px; color: #111827;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid rgba(0, 0, 0, 0.05); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #0f172a; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em;">One8 <span style="color: #f59e0b;">AI</span></h1>
                  <p style="font-size: 14px; color: #4b5563; margin-top: 5px;">Luxury Intelligence Commerce</p>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 10px;">
                  <p style="font-size: 16px; line-height: 1.6; color: #334155;">Hello,</p>
                  <p style="font-size: 16px; line-height: 1.6; color: #334155;">Thank you for registering at One8 Marketplace. To complete your account creation and verify your email, please use the following 6-digit verification code:</p>
                  
                  <div style="text-align: center; margin: 35px 0;">
                    <span style="display: inline-block; font-size: 38px; font-weight: 800; letter-spacing: 0.25em; color: #0f172a; background: #f3f4f6; padding: 15px 30px; border-radius: 16px; border: 1px solid #e5e7eb;">
                      ${code}
                    </span>
                  </div>
                  
                  <p style="font-size: 14px; line-height: 1.5; color: #6b7280; font-style: italic;">Note: This verification code is valid for 5 minutes. Do not share this code with anyone.</p>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                  <p>© 2026 One8 AI Marketplace. All rights reserved.</p>
                </div>
              </div>
            </div>
          `
        })
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[Brevo] Verification email sent to ${toEmail}. ID: ${data.messageId}`);
        return true;
      } else {
        console.error(`[Brevo Error] Failed to send email to ${toEmail}:`, data);
        return false;
      }
    } catch (error) {
      console.error(`[Brevo Error] Failed to send email to ${toEmail}:`, error.message);
      return false;
    }
  } else if (resendApiKey && !resendApiKey.includes('your_resend_api_key')) {
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmail,
          subject: 'Verify Your Email Address - One8 AI Marketplace',
          html: `
            <div style="font-family: 'Inter', sans-serif; background-color: #f9fafb; padding: 40px; color: #111827;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid rgba(0, 0, 0, 0.05); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #0f172a; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em;">One8 <span style="color: #f59e0b;">AI</span></h1>
                  <p style="font-size: 14px; color: #4b5563; margin-top: 5px;">Luxury Intelligence Commerce</p>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 10px;">
                  <p style="font-size: 16px; line-height: 1.6; color: #334155;">Hello,</p>
                  <p style="font-size: 16px; line-height: 1.6; color: #334155;">Thank you for registering at One8 Marketplace. To complete your account creation and verify your email, please use the following 6-digit verification code:</p>
                  
                  <div style="text-align: center; margin: 35px 0;">
                    <span style="display: inline-block; font-size: 38px; font-weight: 800; letter-spacing: 0.25em; color: #0f172a; background: #f3f4f6; padding: 15px 30px; border-radius: 16px; border: 1px solid #e5e7eb;">
                      ${code}
                    </span>
                  </div>
                  
                  <p style="font-size: 14px; line-height: 1.5; color: #6b7280; font-style: italic;">Note: This verification code is valid for 5 minutes. Do not share this code with anyone.</p>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                  <p>© 2026 One8 AI Marketplace. All rights reserved.</p>
                </div>
              </div>
            </div>
          `
        })
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[Resend] Verification email sent to ${toEmail}. ID: ${data.id}`);
        return true;
      } else {
        console.error(`[Resend Error] Failed to send email to ${toEmail}:`, data);
        return false;
      }
    } catch (error) {
      console.error(`[Resend Error] Failed to send email to ${toEmail}:`, error.message);
      return false;
    }
  }

  console.warn(`[Mailer Warning] No email API key (BREVO_API_KEY or RESEND_API_KEY) is configured. Verification code for ${toEmail} is logged in console: ${code}`);
  return false;
};
