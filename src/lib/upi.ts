import QRCode from "qrcode";

// Works on both server (bill HTML rendering) and client (print preview),
// since `qrcode` encodes PNG data URLs without needing a canvas.

export interface UpiPaymentDetails {
  payeeVpa: string;
  payeeName: string;
  amount?: number;
  note?: string;
}

// UPI deep-link intent per the NPCI linking spec.
// Encoded manually because URLSearchParams turns spaces into "+",
// which some UPI apps fail to decode in pn/tn fields.
export function buildUpiUri({ payeeVpa, payeeName, amount, note }: UpiPaymentDetails): string {
  const params = [
    `pa=${encodeURIComponent(payeeVpa)}`,
    `pn=${encodeURIComponent(payeeName)}`,
    "cu=INR",
  ];
  if (amount && amount > 0) {
    params.push(`am=${amount.toFixed(2)}`);
  }
  if (note) {
    params.push(`tn=${encodeURIComponent(note.slice(0, 80))}`);
  }
  return `upi://pay?${params.join("&")}`;
}

export async function generateUpiQrDataUrl(uri: string, size = 220): Promise<string> {
  return QRCode.toDataURL(uri, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}

// Self-contained payment block dropped into invoice HTML — inline styles only,
// since each template ships its own stylesheet.
export function buildUpiBlockHtml(qrDataUrl: string, upiId: string, amount: number): string {
  return `
    <div class="upi-payment" style="display: inline-flex; align-items: center; gap: 12px; margin-top: 12px; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; page-break-inside: avoid;">
      <img src="${qrDataUrl}" alt="UPI payment QR code" width="96" height="96" style="display: block;" />
      <div style="font-size: 12px; line-height: 1.5;">
        <div style="font-weight: 700;">Scan to pay &#8377;${amount.toFixed(2)}</div>
        <div>UPI ID: ${upiId}</div>
        <div style="color: #777;">GPay &middot; PhonePe &middot; Paytm &middot; BHIM</div>
      </div>
    </div>`;
}
