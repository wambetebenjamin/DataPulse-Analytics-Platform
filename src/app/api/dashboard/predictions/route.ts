import { requireUser } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api";
import { churnRisk, forecastSummary, revenueForecast, stockoutPredictions } from "@/data/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Forecasts. Everything returned here is model output and is labelled
 * `isEstimate: true` so no downstream consumer can present it as actual.
 */
export async function GET(request: Request) {
  const auth = await requireUser({ tab: "predictions" });
  if ("response" in auth) return auth.response;

  const raw = Number(new URL(request.url).searchParams.get("horizon") ?? 30);
  const horizon: 30 | 60 | 90 = raw === 60 ? 60 : raw === 90 ? 90 : 30;

  return jsonNoStore({
    ok: true,
    horizon,
    isEstimate: true,
    method: "Ordinary least-squares linear regression over 60 days of daily revenue",
    interval: "95% prediction interval, ±1.96σ√(1 + k/n)",
    forecast: revenueForecast(horizon),
    summary: forecastSummary(horizon),
    stockouts: stockoutPredictions(),
    churnRisk,
    generatedAt: new Date().toISOString(),
  });
}
