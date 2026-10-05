import { requireUser } from "@/lib/auth";
import { jsonNoStore, readRange } from "@/lib/api";
import {
  acquisition,
  churnRisk,
  clvDistribution,
  customerGeo,
  kpis,
  newVsReturning,
} from "@/data/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser({ tab: "customers" });
  if ("response" in auth) return auth.response;

  const range = readRange(request);

  return jsonNoStore({
    ok: true,
    range,
    kpis: kpis(range).filter((k) => k.icon === "customers"),
    acquisition,
    newVsReturning,
    clvDistribution,
    geo: customerGeo,
    // Churn scores are model output: always flagged so a consumer cannot
    // mistake them for observed fact.
    churnRisk: churnRisk.map((c) => ({ ...c, isEstimate: true })),
    generatedAt: new Date().toISOString(),
  });
}
