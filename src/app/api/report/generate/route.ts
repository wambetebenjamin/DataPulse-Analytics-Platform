import { requireUser } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api";
import { readJson, sanitise, str } from "@/lib/validation";
import {
  KES,
  monthlySeries,
  products,
  revenueForecast,
  revenueTargets,
  salesFunnel,
} from "@/data/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Build a report payload server-side.
 *
 * The browser renders ad-hoc PDFs with jsPDF (src/lib/pdf.ts). This route
 * exists for the scheduled path, where no browser is involved: a cron job
 * calls it, then hands the result to /api/report/deliver. It returns
 * structured sections rather than a binary so the delivery step can render
 * either a PDF attachment or a WhatsApp text summary from one source.
 */

type Section = { heading: string; rows: [string, string][] };

const BUILDERS: Record<string, () => Section> = {
  Revenue: () => {
    const months = monthlySeries();
    const last = months.at(-1)!;
    return {
      heading: "Revenue",
      rows: [
        ["Last full month", KES(last.revenue)],
        ["Target", KES(last.target)],
        ["Attainment", `${Math.round((last.revenue / last.target) * 100)}%`],
        [
          "Year on year",
          `${Math.round(((last.revenue - last.lastYear) / last.lastYear) * 100)}%`,
        ],
      ],
    };
  },
  Targets: () => ({
    heading: "Targets",
    rows: revenueTargets.map(
      (t) =>
        [t.label, `${KES(t.actual, true)} of ${KES(t.target, true)} (${Math.round(
          (t.actual / t.target) * 100
        )}%)`] as [string, string]
    ),
  }),
  "Sales funnel": () => ({
    heading: "Sales funnel",
    rows: salesFunnel.map((s) => [s.stage, `${s.count} (${s.rate}%)`] as [string, string]),
  }),
  Inventory: () => ({
    heading: "Inventory",
    rows: products
      .filter((p) => p.stock <= p.reorderPoint)
      .map(
        (p) =>
          [p.name, `${p.stock} on hand, reorder at ${p.reorderPoint}`] as [string, string]
      ),
  }),
  Forecast: () => {
    const points = revenueForecast(30).filter((p) => p.forecast !== null && p.actual === null);
    const total = points.reduce((a, p) => a + (p.forecast ?? 0), 0);
    return {
      heading: "Forecast (estimate)",
      rows: [
        ["Projected, next 30 days", KES(Math.round((total / points.length) * 30))],
        ["Method", "Linear regression, 95% prediction interval"],
        ["Status", "Estimate — not a commitment"],
      ],
    };
  },
};

export async function POST(request: Request) {
  const auth = await requireUser({ tab: "reports" });
  if ("response" in auth) return auth.response;

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return jsonNoStore({ ok: false, error: "Invalid request." }, { status: 400 });

  const title = sanitise(str(body.title, 160)) || "DataPulse business report";
  const range = sanitise(str(body.range, 60)) || "Last 30 days";
  const requested = Array.isArray(body.metrics)
    ? (body.metrics as unknown[]).map((m) => sanitise(str(m, 60))).slice(0, 20)
    : ["Revenue"];

  const sections = requested
    .map((metric) => {
      const key = Object.keys(BUILDERS).find((k) => metric.toLowerCase().includes(k.toLowerCase()));
      return key ? BUILDERS[key]!() : null;
    })
    .filter((s): s is Section => s !== null);

  if (sections.length === 0) sections.push(BUILDERS.Revenue!());

  return jsonNoStore({
    ok: true,
    report: {
      id: `RPT-${Date.now().toString(36).toUpperCase()}`,
      title,
      range,
      organisation: auth.user.organisation,
      generatedBy: auth.user.email,
      generatedAt: new Date().toISOString(),
      sections,
      disclaimer:
        "Figures labelled as estimates are model output and carry a confidence interval. They are guidance, not guarantees.",
    },
  });
}
