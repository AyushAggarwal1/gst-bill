// Rate-wise tax break-up for invoices.
//
// A bill can mix items in different GST slabs (12% stationery + 18%
// electronics). GST invoices must show tax per rate — printing a single
// CGST/SGST row labelled with one item's rate against the summed amount
// produces numbers that don't reconcile. These helpers group by the actual
// item rates so every printed row is independently verifiable.

export interface TaxLine {
  label: string;
  amount: number;
}

interface TaxableBillItem {
  taxAmount: number;
  item?: { taxRate?: number | null } | null;
}

// Render 12 -> "12", 12.5 -> "12.5", 0.25/2 -> "0.125" without float noise
function formatRate(rate: number): string {
  return String(parseFloat(rate.toFixed(3)));
}

export function getTaxBreakup(items: TaxableBillItem[], isIGST: boolean): TaxLine[] {
  const byRate = new Map<number, number>();
  for (const billItem of items || []) {
    const rate = billItem.item?.taxRate ?? 0;
    byRate.set(rate, (byRate.get(rate) || 0) + (billItem.taxAmount || 0));
  }

  const rates = [...byRate.keys()]
    .filter((rate) => rate > 0 || (byRate.get(rate) || 0) > 0)
    .sort((a, b) => a - b);

  // All items zero-rated (or no items): keep the familiar zero rows
  if (rates.length === 0) {
    return isIGST
      ? [{ label: "IGST (0%)", amount: 0 }]
      : [
          { label: "CGST (0%)", amount: 0 },
          { label: "SGST (0%)", amount: 0 },
        ];
  }

  const lines: TaxLine[] = [];
  for (const rate of rates) {
    const taxForRate = byRate.get(rate) || 0;
    if (isIGST) {
      lines.push({ label: `IGST (${formatRate(rate)}%)`, amount: taxForRate });
    } else {
      lines.push({ label: `CGST (${formatRate(rate / 2)}%)`, amount: taxForRate / 2 });
      lines.push({ label: `SGST (${formatRate(rate / 2)}%)`, amount: taxForRate / 2 });
    }
  }
  return lines;
}

// The {{TAX_ROWS}} fragment consumed by bill templates: <tr> rows with two cells.
export function buildTaxRowsHtml(items: TaxableBillItem[], isIGST: boolean): string {
  return getTaxBreakup(items, isIGST)
    .map(
      (line) => `
      <tr>
        <td>${line.label}:</td>
        <td>₹${line.amount.toFixed(2)}</td>
      </tr>`,
    )
    .join("");
}
