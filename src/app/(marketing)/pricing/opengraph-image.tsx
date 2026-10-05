import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "DataPulse Analytics pricing — Starter KES 2,999, Business KES 7,999";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgCard({
    eyebrow: "Pricing",
    title: "Transparent pricing, in Kenyan Shillings.",
    description:
      "Starter at KES 2,999/month. Business at KES 7,999/month with forecasting and WhatsApp reports. Enterprise quoted to fit.",
    tags: ["14-day free trial", "No card required", "M-Pesa billing"],
  });
}
