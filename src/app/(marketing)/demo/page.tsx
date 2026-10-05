import type { Metadata } from "next";
import DemoDashboard from "@/components/dashboard/DemoDashboard";
import page from "@/components/marketing/page-header.module.css";

export const metadata: Metadata = {
  title: "Live Demo Dashboard",
  description:
    "Explore a working DataPulse analytics dashboard with sample East African business data — revenue, sales funnel, top products, customer acquisition and live alerts. No login required.",
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "Live Demo — DataPulse Analytics",
    description:
      "A fully working business intelligence dashboard with real East African sample data. No signup, no card.",
    url: "/demo",
  },
};

/**
 * Public demo. Brief: "SSR with dummy data, public access."
 * Rendered dynamically so the sample series is produced on each request rather
 * than frozen at build time.
 */
export const dynamic = "force-dynamic";

export default function DemoPage() {
  return (
    <>
      <header className={page.header}>
        <div className="dp-container">
          <p className="dp-eyebrow">Live demo · no login required</p>
          <h1 className={page.title}>A real dashboard, running on sample data</h1>
          <p className={page.lede}>
            Everything below is interactive. Change the date range, read the alerts, export the
            view to PDF. The only difference between this and your account is whose numbers are
            in it.
          </p>
        </div>
      </header>

      <div className="dp-container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <DemoDashboard />
      </div>
    </>
  );
}
