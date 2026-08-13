export interface WelcomeEmailHtmlOptions {
  name?: string;
  appName?: string;
  dashboardUrl?: string;
}

/**
 * Returns clean, responsive HTML for Welcome Email adhering to Health AI light luxury theme.
 */
export function getWelcomeEmailHtml(options: WelcomeEmailHtmlOptions = {}): string {
  const {
    name = 'Valued User',
    appName = 'Health AI Platform',
    dashboardUrl = 'http://localhost:5173',
  } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${appName}</title>
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
                ✦ Welcome Onboard
              </div>
              <h1 style="margin: 16px 0 0 0; color: #0f172a; font-size: 24px; font-weight: 700;">
                Welcome to ${appName}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 24px 40px; color: #334155; font-size: 15px; line-height: 1.6;">
              <p style="margin: 0 0 16px 0;">Hello <strong>${name}</strong>,</p>
              <p style="margin: 0 0 20px 0;">
                Your account is now fully verified and activated. You have full access to continuous physiological telemetry, Digital Twin biometric modeling, and intelligent stress analysis.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                  Access Your Health Dashboard →
                </a>
              </div>
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
