import { requireUser } from "@/lib/auth";
import { jsonNoStore, readRange } from "@/lib/api";
import {
  RANGE_DAYS,
  buildDailySeries,
  monthlySeries,
  revenueByCategory,
  revenueTargets,
  weeklySeries,
} from "@/data/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser({ tab: "revenue" });
  if ("response" in auth) return auth.response;

  const range = readRange(request);
  const grain = new URL(request.url).searchParams.get("grain") ?? "daily";

  const series =
    grain === "monthly"
      ? monthlySeries()
      : grain === "weekly"
        ? weeklySeries()
        : buildDailySeries(RANGE_DAYS[range]);

  return jsonNoStore({
    ok: true,
    range,
    grain,
    series,
    categories: revenueByCategory,
    targets: revenueTargets,
    generatedAt: new Date().toISOString(),
  });
}
