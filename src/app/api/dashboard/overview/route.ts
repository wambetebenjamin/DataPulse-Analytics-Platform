import { requireUser } from "@/lib/auth";
import { jsonNoStore, readRange } from "@/lib/api";
import {
  RANGE_DAYS,
  RANGE_LABEL,
  alerts,
  buildDailySeries,
  kpis,
  revenueByCategory,
  revenueTargets,
  transactions,
} from "@/data/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Overview tab data. Role-gated: every role that can see the tab can read it. */
export async function GET(request: Request) {
  const auth = await requireUser({ tab: "overview" });
  if ("response" in auth) return auth.response;

  const range = readRange(request);

  return jsonNoStore({
    ok: true,
    range,
    rangeLabel: RANGE_LABEL[range],
    generatedAt: new Date().toISOString(),
    kpis: kpis(range),
    series: buildDailySeries(RANGE_DAYS[range]),
    categories: revenueByCategory,
    targets: revenueTargets,
    transactions: transactions.slice(0, 10),
    alerts: alerts.slice(0, 4),
  });
}
