import { prisma } from "@/lib/prisma";
import { renderBillHtml } from "@/lib/billHtml";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ token: string }>;
}

// Serves the raw invoice HTML with an auto-print trigger — the browser's
// print dialog doubles as "Save as PDF" on desktop and mobile.
export async function GET(_req: Request, { params }: RouteParams) {
  const { token } = await params;

  if (!token || token.length < 16) {
    return new Response("Not found", { status: 404 });
  }

  const bill = await prisma.bill.findUnique({
    where: { publicToken: token },
    include: {
      customer: true,
      items: { include: { item: true } },
      user: { include: { profile: true } },
    },
  });

  if (!bill) {
    return new Response("Not found", { status: 404 });
  }

  let html = await renderBillHtml(bill, bill.user?.profile);
  const printScript =
    "<script>window.addEventListener('load',function(){setTimeout(function(){window.print()},300)})</script>";
  html = html.includes("</body>")
    ? html.replace(/<\/body>/i, `${printScript}</body>`)
    : html + printScript;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
