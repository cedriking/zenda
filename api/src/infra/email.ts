import { logger } from "./logger.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM_EMAIL = process.env.EMAIL_FROM ?? "noreply@zenda.bot";
const APP_URL = process.env.APP_URL ?? "https://zenda.bot";

interface SendEmailParams {
  html: string;
  subject: string;
  to: string;
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not set — skipping email send", {
      to,
      subject,
    });
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      logger.error("Resend API error", { status: res.status, body: errBody });
      return false;
    }

    logger.info("Email sent", { to, subject });
    return true;
  } catch (err) {
    logger.error("Failed to send email", { to, error: (err as Error).message });
    return false;
  }
}

export function buildPasswordResetEmailHtml(resetToken: string): {
  subject: string;
  html: string;
} {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
  return {
    subject: "Reset your Zenda password",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="font-size: 24px; font-weight: 700;">Reset your password</h1>
          <p style="font-size: 16px;">We received a request to reset the password for your Zenda account.</p>
          <p style="font-size: 16px;">Click the button below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 16px 0;">Reset Password</a>
          <p style="font-size: 14px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="font-size: 12px; color: #94a3b8;">Zenda — AI Receptionist for appointment-based businesses</p>
        </body>
      </html>
    `,
  };
}
