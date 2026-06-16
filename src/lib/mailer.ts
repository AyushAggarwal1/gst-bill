import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const mailFrom = process.env.MAIL_FROM || 'no-reply@example.com';

/**
 * Simple email address extractor/validator.
 * - Accepts "Display Name <addr@example.com>" and "addr@example.com"
 * - Rejects input containing CR/LF (header injection)
 * - Splits on comma/semicolon when a string of multiple addresses is provided
 * - Throws on invalid or empty recipient list
 */
function extractAddress(token: string): string {
  // Reject header-injection attempts
  if (/|
/.test(token)) {
    throw new Error('Recipient contains invalid characters');
  }

  const angleMatch = token.match(/<([^>]+)>/);
  const addr = (angleMatch && angleMatch[1]) ? angleMatch[1].trim() : token.trim();

  return addr;
}

function isValidEmail(addr: string): boolean {
  // Conservative, reasonably permissive regex (no fancy unicode). Good enough for SMTP validation.
  // Allows subdomains and typical TLDs.
  const re = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
  return re.test(addr);
}

function sanitizeRecipients(raw: string | string[] | undefined): string[] {
  if (!raw) return [];

  const tokens: string[] = Array.isArray(raw)
    ? raw.slice()
    : raw.split(/[;,]/).map(s => s.trim());

  const out: string[] = tokens
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => {
      // If token contains a display name with angle-brackets, extract the email inside <> 
      return extractAddress(t);
    })
    .map(addr => {
      if (!isValidEmail(addr)) {
        throw new Error(`Invalid recipient address: ${addr}`);
      }
      return addr.toLowerCase();
    });

  // Deduplicate
  return Array.from(new Set(out));
}

export function getTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('SMTP env vars are not configured');
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendPasswordOtpMail(to: string | string[], otp: string) {
  const transporter = getTransporter();
  const recipients = sanitizeRecipients(to);

  if (recipients.length === 0) {
    throw new Error('No valid recipients provided');
  }

  // Provide an explicit SMTP envelope to avoid interpretation conflicts
  const envelopeTo = recipients;
  const headerTo = recipients.join(', ');

  if (process.env.NODE_ENV !== 'production') {
    // Helpful debug info during development only
    // eslint-disable-next-line no-console
    console.debug('sendPasswordOtpMail - headerTo:', headerTo, 'envelopeTo:', envelopeTo);
  }

  const info = await transporter.sendMail({
    from: mailFrom,
    to: headerTo, // email header (for recipients display)
    subject: 'Your password reset code',
    text: `Use the following code to reset your password: ${otp}. This code expires in 10 minutes.`,
    html: `<p>Use the following code to reset your password:</p><p style="font-size:20px;font-weight:bold;letter-spacing:3px">${otp}</p><p>This code expires in 10 minutes.</p>`,
    envelope: { from: mailFrom, to: envelopeTo },
  });
  return info.messageId;
}

export async function sendSignupOtpMail(to: string | string[], otp: string) {
  const transporter = getTransporter();
  const recipients = sanitizeRecipients(to);

  if (recipients.length === 0) {
    throw new Error('No valid recipients provided');
  }

  const envelopeTo = recipients;
  const headerTo = recipients.join(', ');

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('sendSignupOtpMail - headerTo:', headerTo, 'envelopeTo:', envelopeTo);
  }

  const info = await transporter.sendMail({
    from: mailFrom,
    to: headerTo,
    subject: 'Verify your email to complete signup',
    text: `Use this code to verify your email: ${otp}. It expires in 10 minutes.`,
    html: `<p>Use this code to verify your email:</p><p style="font-size:20px;font-weight:bold;letter-spacing:3px">${otp}</p><p>This code expires in 10 minutes.</p>`,
    envelope: { from: mailFrom, to: envelopeTo },
  });
  return info.messageId;
}