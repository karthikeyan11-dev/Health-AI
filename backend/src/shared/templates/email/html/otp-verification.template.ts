export interface OtpEmailTemplateOptions {
  recipientName?: string;
  otp: string;
  expiresInMinutes?: number;
  appName?: string;
}

/**
 * Generates responsive, luxury healthcare styled HTML email for OTP verification.
 * Adheres to Health AI light theme with signature blue/purple gradient accent.
 */
export function getOtpVerificationEmailHtml(options: OtpEmailTemplateOptions): string {
  const {
    recipientName = 'Valued User',
    otp,
    expiresInMinutes = 5,
    appName = 'Health AI Platform',
  } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName} - Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="height: 6px; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%);"></td>
          </tr>
          <tr>
            <td style="padding: 36px 40px 20px 40px;">
              <div style="display: inline-block; padding: 6px 14px; border-radius: 20px; background: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                ✦ Secure Verification
              </div>
              <h1 style="margin: 16px 0 0 0; color: #0f172a; font-size: 24px; font-weight: 700;">
                Verify Your Account
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 24px 40px; color: #334155; font-size: 15px; line-height: 1.6;">
              <p style="margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
              <p style="margin: 0 0 24px 0;">
                Thank you for registering with <strong>${appName}</strong>. Please enter the one-time verification code below to activate your account:
              </p>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px;">
                <tr>
                  <td align="center" style="padding: 24px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #4f46e5;">
                      ${otp}
                    </span>
                    <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
                      ⏱ This code is valid for <strong>${expiresInMinutes} minutes</strong>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;">
                Never share this verification code with anyone.
              </p>
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                If you did not initiate this request, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0;">${appName} • Intelligent Healthcare & Digital Twin Monitoring</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export const renderOtpVerificationHtml = getOtpVerificationEmailHtml;
