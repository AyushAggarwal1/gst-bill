import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { renderBillHtml } from "@/lib/billHtml";
import { buildUpiUri, generateUpiQrDataUrl } from "@/lib/upi";

// Public, tokenized invoice view — always render fresh, never index.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

async function getBillByToken(token: string) {
  if (!token || token.length < 16) return null;
  return prisma.bill.findUnique({
    where: { publicToken: token },
    include: {
      customer: true,
      items: { include: { item: true } },
      user: { include: { profile: true } },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const bill = await getBillByToken(token);
  const firm = bill?.user?.profile?.firmName;
  return {
    title: bill ? `Invoice ${bill.billNumber}${firm ? ` — ${firm}` : ""}` : "Invoice",
    robots: { index: false, follow: false },
  };
}

export default async function PublicInvoicePage({ params }: PageProps) {
  const { token } = await params;
  const bill = await getBillByToken(token);

  if (!bill) {
    notFound();
  }

  const profile = bill.user?.profile;
  const firmName = profile?.firmName || "Invoice";
  const invoiceHtml = await renderBillHtml(bill, profile);

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || "http";
  const pageUrl = `${proto}://${host}/i/${token}`;

  const waMessage = `Invoice ${bill.billNumber} from ${firmName} for ₹${bill.total.toFixed(2)}\n${pageUrl}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  let upiHref: string | null = null;
  let upiQr: string | null = null;
  if (profile?.upiId && bill.total > 0) {
    upiHref = buildUpiUri({
      payeeVpa: profile.upiId,
      payeeName: firmName,
      amount: bill.total,
      note: `Bill ${bill.billNumber}`,
    });
    upiQr = await generateUpiQrDataUrl(upiHref, 320);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{firmName}</p>
              <h1 className="mt-1 text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Invoice {bill.billNumber}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {format(new Date(bill.billDate), "dd MMM yyyy")} · Billed to {bill.customer.name}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">₹{bill.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={`/i/${token}/print`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold shadow hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share on WhatsApp
            </a>
            {upiHref && (
              <a
                href={upiHref}
                className="inline-flex items-center px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors sm:hidden"
              >
                Pay via UPI
              </a>
            )}
          </div>
        </div>

        {/* UPI payment card */}
        {upiQr && profile?.upiId && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sm:p-6 mb-6 flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={upiQr} alt="UPI payment QR code" className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg border border-gray-200" />
            <div>
              <p className="text-sm font-bold text-gray-900">Scan to pay ₹{bill.total.toFixed(2)}</p>
              <p className="mt-1 text-sm text-gray-600">UPI ID: {profile.upiId}</p>
              <p className="mt-1 text-xs text-gray-500">Works with GPay, PhonePe, Paytm and any UPI app</p>
            </div>
          </div>
        )}

        {/* Invoice document */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <iframe
            srcDoc={invoiceHtml}
            title={`Invoice ${bill.billNumber}`}
            sandbox=""
            className="w-full border-0"
            style={{ height: "1250px" }}
          />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Generated with GSTly · This link shows the invoice as issued by {firmName}
        </p>
      </div>
    </div>
  );
}
