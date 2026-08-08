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

export interface InvoiceMailDetails {
  firmName: string;
  billNumber: string;
  total: number;
  url: string;
}

export async function sendInvoiceMail(to: string, details: InvoiceMailDetails) {
  const { firmName, billNumber, total, url } = details;
  const amount = `₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: mailFrom,
    to,
    subject: `Invoice ${billNumber} from ${firmName} — ${amount}`,
    text: `${firmName} has sent you invoice ${billNumber} for ${amount}.\n\nView, download or pay online: ${url}`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;border:1px solid #e3e3e6;border-radius:8px;overflow:hidden">
        <div style="background:#17181a;color:#fff;padding:16px 20px">
          <div style="font-size:16px;font-weight:700">${firmName}</div>
          <div style="font-size:11px;letter-spacing:2px;opacity:.75;text-transform:uppercase">Tax Invoice</div>
        </div>
        <div style="padding:20px">
          <p style="margin:0 0 6px;font-size:14px">Invoice <strong>${billNumber}</strong></p>
          <p style="margin:0 0 16px;font-size:24px;font-weight:700">${amount}</p>
          <a href="${url}" style="display:inline-block;background:#23408e;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px;font-weight:600">View invoice</a>
          <p style="margin:16px 0 0;font-size:12px;color:#777">You can view, download the PDF, or pay via UPI from this link.</p>
        </div>
      </div>`,
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


