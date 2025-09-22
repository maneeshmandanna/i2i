// Simple email service for magic links
// You can replace this with SendGrid, Resend, or any email service

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  subject,
  html,
}: EmailOptions): Promise<boolean> {
  try {
    // For development/testing, we'll use a simple approach
    // In production, replace this with your preferred email service

    console.log("📧 Email would be sent:");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("HTML:", html);

    // TODO: Replace with actual email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ to, subject, html, from: 'noreply@yourapp.com' });

    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ to, subject, html, from: 'noreply@yourapp.com' });

    // For now, return true to simulate successful sending
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export function createMagicLinkEmail(email: string, magicLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Secure Login Link</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .security-note { background: #EEF2FF; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Secure Login</h1>
        </div>
        <div class="content">
          <h2>Hello!</h2>
          <p>You requested access to the Image Processing Platform. Click the button below to log in securely:</p>
          
          <div style="text-align: center;">
            <a href="${magicLink}" class="button">🚀 Access Platform</a>
          </div>
          
          <div class="security-note">
            <strong>🔒 Security Information:</strong>
            <ul>
              <li>This link expires in 15 minutes</li>
              <li>It can only be used once</li>
              <li>Only whitelisted users can access</li>
              <li>No password required</li>
            </ul>
          </div>
          
          <p>If you didn't request this login, you can safely ignore this email.</p>
          
          <p><small>If the button doesn't work, copy and paste this link:<br>
          <code>${magicLink}</code></small></p>
        </div>
        <div class="footer">
          <p>Image Processing Platform - Secure Access</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
