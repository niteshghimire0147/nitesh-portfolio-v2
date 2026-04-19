import express    from 'express';
import nodemailer  from 'nodemailer';

const router = express.Router();

// Strip CRLF from any string — prevents email header injection
function safeHeader(str = '') {
  return String(str).replace(/[\r\n]/g, ' ').trim();
}

// Escape user content rendered inside HTML email body
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }

    // Length guards
    if (name.length > 100 || (subject && subject.length > 200) || message.length > 5000) {
      return res.status(400).json({ message: 'Input exceeds maximum length' });
    }

    // Sanitize headers (prevent injection via CRLF)
    const safeName    = safeHeader(name);
    const safeSubject = safeHeader(subject);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from:    { name: safeName, address: process.env.EMAIL_USER },
      replyTo: email,
      to:      process.env.EMAIL_USER,
      subject: safeSubject
        ? `[Portfolio] ${safeSubject}`
        : `[Portfolio] Message from ${safeName}`,
      html: `
        <div style="font-family:monospace;background:#0a0e1a;color:#e2e8f0;padding:24px;border-radius:8px;border:1px solid #1a2a4a;">
          <h2 style="color:#00d4ff;margin-top:0;">📬 New Portfolio Contact</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;width:80px;">Name</td><td style="color:#e2e8f0;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="color:#00d4ff;">${escapeHtml(email)}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Subject</td><td style="color:#e2e8f0;">${escapeHtml(subject || 'N/A')}</td></tr>
          </table>
          <hr style="border-color:#1a2a4a;margin:16px 0;"/>
          <p style="color:#6b7280;margin-bottom:8px;">Message:</p>
          <p style="color:#e2e8f0;white-space:pre-wrap;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    res.json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

export default router;
