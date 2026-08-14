/**
 * Email service — Nodemailer with SMTP or Ethereal (free test inbox).
 *
 * Production: set EMAIL_HOST / EMAIL_USER / EMAIL_PASS in .env (e.g. Gmail App Password).
 * Development: if SMTP is missing, Ethereal auto-creates a test mailbox + preview URL.
 */
import nodemailer from 'nodemailer';
import config from '../config/env.js';

let transporterPromise = null;

const hasSmtpConfig = () =>
  Boolean(config.email.host && config.email.user && config.email.pass);

/**
 * Lazily create transporter once (reuse connections).
 */
const getTransporter = async () => {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (hasSmtpConfig()) {
      const transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });

      console.log(`Email: using SMTP ${config.email.host}:${config.email.port}`);
      return { transporter, mode: 'smtp' };
    }

    // Free Ethereal test account — open preview URL in browser to read mail
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('Email: Ethereal test mode (no SMTP credentials in .env)');
    console.log(`Email: Ethereal user ${testAccount.user}`);
    return { transporter, mode: 'ethereal' };
  })();

  return transporterPromise;
};

/**
 * Low-level send. Returns { messageId, previewUrl? }.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  // Tests should not hit real SMTP / Ethereal
  if (config.nodeEnv === 'test') {
    return { messageId: 'test-message-id', previewUrl: null, mode: 'test' };
  }

  const { transporter, mode } = await getTransporter();

  const info = await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text: text || subject,
    html,
  });

  const previewUrl =
    mode === 'ethereal' ? nodemailer.getTestMessageUrl(info) : null;

  if (previewUrl) {
    console.log(`Email preview (${subject}): ${previewUrl}`);
  } else {
    console.log(`Email sent to ${to}: ${subject}`);
  }

  return {
    messageId: info.messageId,
    previewUrl,
    mode,
  };
};

/** Safe fire-and-forget wrapper — never crashes the API if mail fails */
export const sendEmailSafe = async (options) => {
  try {
    return await sendEmail(options);
  } catch (error) {
    console.error(`Email failed (${options.subject}):`, error.message);
    return null;
  }
};

// -------------------- HTML helpers --------------------

const layout = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${title}</title></head>
<body style="font-family:Segoe UI,Arial,sans-serif;background:#f4f4f5;padding:24px;color:#18181b;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e4e4e7;">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Smart Apartment VMS</p>
    <h1 style="margin:0 0 16px;font-size:22px;">${title}</h1>
    ${bodyHtml}
    <p style="margin:28px 0 0;font-size:12px;color:#a1a1aa;">This is an automated message — please do not reply.</p>
  </div>
</body>
</html>
`;

/**
 * Password reset email
 */
export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  return sendEmail({
    to,
    subject: 'Reset your Smart Apartment VMS password',
    text: `Hi ${name}, reset your password: ${resetUrl} (expires in 10 minutes)`,
    html: layout(
      'Reset your password',
      `
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below — the link expires in <strong>10 minutes</strong>.</p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
          Reset password
        </a>
      </p>
      <p style="font-size:13px;color:#71717a;word-break:break-all;">Or paste this link:<br/>${resetUrl}</p>
      <p style="font-size:13px;color:#71717a;">If you did not request this, you can ignore this email.</p>
      `
    ),
  });
};

/**
 * Welcome email after registration
 */
export const sendWelcomeEmail = async ({ to, name, role }) => {
  return sendEmailSafe({
    to,
    subject: 'Welcome to Smart Apartment VMS',
    text: `Hi ${name}, your ${role} account is ready.`,
    html: layout(
      'Welcome aboard',
      `
      <p>Hi ${name},</p>
      <p>Your <strong>${role}</strong> account is ready. Sign in to manage visitors, parcels, complaints, and notices.</p>
      <p style="margin:24px 0;">
        <a href="${config.clientUrl}/login" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
          Sign in
        </a>
      </p>
      `
    ),
  });
};

/**
 * Notify resident that a visitor was registered
 */
export const sendVisitorRegisteredEmail = async ({
  to,
  residentName,
  visitorName,
  purpose,
  expectedDate,
}) => {
  const when = expectedDate
    ? new Date(expectedDate).toLocaleDateString()
    : 'soon';

  return sendEmailSafe({
    to,
    subject: `Visitor registered: ${visitorName}`,
    text: `${visitorName} is scheduled to visit you (${purpose}) on ${when}.`,
    html: layout(
      'Visitor registered',
      `
      <p>Hi ${residentName},</p>
      <p><strong>${visitorName}</strong> is scheduled to visit you.</p>
      <ul style="padding-left:18px;color:#3f3f46;">
        <li>Purpose: ${purpose || 'Personal visit'}</li>
        <li>Expected: ${when}</li>
      </ul>
      <p style="margin:24px 0;">
        <a href="${config.clientUrl}/resident/visitors" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
          View visitors
        </a>
      </p>
      `
    ),
  });
};

/**
 * Notify resident a parcel arrived
 */
export const sendParcelReceivedEmail = async ({
  to,
  residentName,
  courier,
  trackingId,
  description,
}) => {
  return sendEmailSafe({
    to,
    subject: `Parcel arrived from ${courier || 'courier'}`,
    text: `A parcel for you has arrived at the gate (${courier}${trackingId ? ` / ${trackingId}` : ''}).`,
    html: layout(
      'Parcel at the gate',
      `
      <p>Hi ${residentName},</p>
      <p>A parcel is waiting for you at the gate.</p>
      <ul style="padding-left:18px;color:#3f3f46;">
        <li>Courier: ${courier || 'Unknown'}</li>
        ${trackingId ? `<li>Tracking: ${trackingId}</li>` : ''}
        <li>Description: ${description || 'Parcel'}</li>
      </ul>
      <p style="margin:24px 0;">
        <a href="${config.clientUrl}/resident/parcels" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
          View parcels
        </a>
      </p>
      `
    ),
  });
};

/**
 * Notify resident about a published notice
 */
export const sendNoticePublishedEmail = async ({ to, residentName, noticeTitle }) => {
  return sendEmailSafe({
    to,
    subject: `New notice: ${noticeTitle}`,
    text: `A new community notice was published: ${noticeTitle}`,
    html: layout(
      'New community notice',
      `
      <p>Hi ${residentName},</p>
      <p>Management published a new notice:</p>
      <p style="font-size:16px;font-weight:600;">${noticeTitle}</p>
      <p style="margin:24px 0;">
        <a href="${config.clientUrl}/resident/notices" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
          Read notices
        </a>
      </p>
      `
    ),
  });
};

export const getEmailMode = async () => {
  const { mode } = await getTransporter();
  return mode;
};
