import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const mailFrom = process.env.MAIL_FROM || 'no-reply@example.com';

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

export async function sendPasswordOtpMail(to: string, otp: string) {
  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: mailFrom,
    to,
    subject: 'Your password reset code',
    text: `Use the following code to reset your password: ${otp}. This code expires in 10 minutes.`,
    html: `<p>Use the following code to reset your password:</p><p style="font-size:20px;font-weight:bold;letter-spacing:3px">${otp}</p><p>This code expires in 10 minutes.</p>`,
  });
  return info.messageId;
}

export async function sendSignupOtpMail(to: string, otp: string) {
  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: mailFrom,
    to,
    subject: 'Verify your email to complete signup',
    text: `Use this code to verify your email: ${otp}. It expires in 10 minutes.`,
    html: `<p>Use this code to verify your email:</p><p style="font-size:20px;font-weight:bold;letter-spacing:3px">${otp}</p><p>This code expires in 10 minutes.</p>`,
  });
  return info.messageId;
}


