import nodemailer from 'nodemailer';

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

export async function sendSecurityAlert(subject, details) {
  const transporter = getTransporter();
  if (!transporter) return;

  const html = `
    <div style="font-family:monospace;background:#0a0e1a;color:#e2e8f0;padding:24px;border-radius:8px;border:1px solid #ff4444;">
      <h2 style="color:#ff4444;margin-top:0;">🚨 Security Alert</h2>
      <p style="color:#6b7280;">Time: ${new Date().toISOString()}</p>
      <hr style="border-color:#1a2a4a;margin:12px 0;"/>
      <pre style="color:#e2e8f0;white-space:pre-wrap;">${details}</pre>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `[SECURITY ALERT] ${subject}`,
      html,
    });
  } catch (err) {
    console.error('[MAILER] Alert failed:', err.message);
  }
}
