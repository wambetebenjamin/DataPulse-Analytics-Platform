import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";
import { USE_CASES } from "@/data/site";

export const runtime = "nodejs";
export const alt = "DataPulse Analytics use cases across eight East African industries";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgCard({
    eyebrow: "Use cases",
    title: "Built for how your industry actually trades.",
    description: `Retail, hospitality, education, health, professional services and the non-profit sector — ${USE_CASES.length} industries, each with the metrics that matter in it.`,
    tags: USE_CASES.slice(0, 4).map((uc) => uc.industry),
  });
}
