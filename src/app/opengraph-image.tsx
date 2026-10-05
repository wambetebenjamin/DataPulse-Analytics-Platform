import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "DataPulse Analytics — Turn Your Business Data Into Decisions";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgCard({
    eyebrow: "Business intelligence for East Africa",
    title: "Turn Your Business Data Into Decisions.",
    description:
      "Real-time analytics, predictive insights, and custom dashboards for East African businesses.",
    tags: ["Real-time dashboards", "Forecasting", "M-Pesa", "WhatsApp reports"],
  });
}
