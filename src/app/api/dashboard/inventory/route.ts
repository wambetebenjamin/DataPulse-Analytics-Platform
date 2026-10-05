import { requireUser } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api";
import { products, stockoutPredictions } from "@/data/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUser({ tab: "inventory" });
  if ("response" in auth) return auth.response;

  const predictions = stockoutPredictions();

  return jsonNoStore({
    ok: true,
    products,
    lowStock: products.filter((p) => p.stock <= p.reorderPoint).map((p) => p.name),
    predictions: predictions.map((p) => ({ ...p, isEstimate: true })),
    generatedAt: new Date().toISOString(),
  });
}
