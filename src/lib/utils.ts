export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

// Build a WhatsApp share URL. With a usable phone number the customer's chat
// opens directly; otherwise WhatsApp falls back to its contact picker.
export function buildWhatsAppUrl(message: string, phone?: string | null): string {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1); // drop trunk zero (e.g. 098220...)
  }
  if (digits.length === 10) {
    digits = `91${digits}`; // assume India when no country code is given
  }
  const base = digits.length >= 11 ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

// Cryptographically-secure numeric OTP. Uses Web Crypto (globalThis.crypto),
// available in the Node server runtime, Edge, and browsers — never Math.random,
// which is predictable and unsafe for security codes.
export function generateNumericOtp(length = 6): string {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  let otp = '';
  for (let i = 0; i < length; i += 1) {
    otp += (values[i] % 10).toString();
  }
  return otp;
}