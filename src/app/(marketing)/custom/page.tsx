import type { Metadata } from "next";
import { Blocks, Database, GitBranch, LineChart, MessageCircle, Workflow } from "lucide-react";
import CustomProjectForm from "@/components/forms/CustomProjectForm";
import { whatsappLink } from "@/data/site";
import page from "@/components/marketing/page-header.module.css";
import styles from "@/components/marketing/custom.module.css";

export const metadata: Metadata = {
  title: "Custom Analytics Projects",
  description:
    "Bespoke dashboards, data pipelines and predictive models for East African organisations whose needs go beyond the standard DataPulse platform.",
  alternates: { canonical: "/custom" },
  openGraph: {
    title: "Custom Analytics Projects — DataPulse",
    description:
      "Tell us what you need: custom dashboards, data warehousing, M-Pesa reconciliation, bespoke forecasting models.",
    url: "/custom",
  },
};

const SERVICES = [
  {
    icon: Blocks,
    title: "Bespoke dashboards",
    copy: "Screens designed around your actual decisions and your actual vocabulary, not a template bent into shape.",
  },
  {
    icon: Database,
    title: "Data pipelines & warehousing",
    copy: "Pull from M-Pesa, POS, ERP, spreadsheets and custom APIs into one clean, reconciled store you can trust.",
  },
  {
    icon: LineChart,
    title: "Predictive modelling",
    copy: "Demand forecasting, churn scoring, credit risk and seasonality models trained on your own history.",
  },
  {
    icon: Workflow,
    title: "Process automation",
    copy: "Replace the Friday-afternoon spreadsheet ritual with a scheduled report that writes itself.",
  },
  {
    icon: GitBranch,
    title: "System integration",
    copy: "Connect the tools you already pay for so they stop disagreeing with each other about the numbers.",
  },
  {
    icon: MessageCircle,
    title: "Training & handover",
    copy: "Your team leaves able to maintain and extend what we built. No permanent dependency on us.",
  },
];

const PROCESS = [
  { step: "Discovery", copy: "A free 45-minute session to map your data sources, decisions and reporting pain." },
  { step: "Scope & quote", copy: "A written proposal with fixed deliverables, timeline and price. No hourly surprises." },
  { step: "Build", copy: "Two-week sprints with a working demo at the end of each one. You see progress, not status reports." },
  { step: "Launch & train", copy: "Deployment, team training and 30 days of included support after go-live." },
];

export default function CustomPage() {
  return (
    <>
      <header className={page.header}>
        <div className="dp-container">
          <p className="dp-eyebrow">Custom projects</p>
          <h1 className={`${page.title} ${page.titleWide}`}>
            When the standard platform is not quite the shape of your problem
          </h1>
          <p className={page.lede}>
            Some organisations need something built. A county health department reconciling six
            data systems, a SACCO scoring loan risk, a manufacturer forecasting raw material
            demand — that is custom work, and it is what our analytics team does between platform
            releases.
          </p>
        </div>
      </header>

      <section className={styles.servicesSection} aria-labelledby="services-heading">
        <div className="dp-container">
          <h2 id="services-heading" className={styles.sectionTitle}>
            What we build
          </h2>
          <div className={styles.services}>
            {SERVICES.map((s) => (
              <article key={s.title} className={styles.service}>
                <span className={styles.serviceIcon}>
                  <s.icon size={19} aria-hidden="true" />
                </span>
                <h3 className={styles.serviceTitle}>{s.title}</h3>
                <p className={styles.serviceCopy}>{s.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className="dp-container">
          <div className={styles.formGrid}>
            <div className={styles.formCol}>
              <h2 className={styles.formTitle}>Tell us about your project</h2>
              <p className={styles.formLede}>
                The more detail you give, the more useful our first response will be. Everything
                below stays confidential.
              </p>
              <CustomProjectForm />
            </div>

            <aside className={styles.processCol}>
              <h2 className={styles.processTitle}>How it works</h2>
              <ol className={styles.process}>
                {PROCESS.map((p, i) => (
                  <li key={p.step}>
                    <span className={styles.processNum}>{i + 1}</span>
                    <div>
                      <span className={styles.processStep}>{p.step}</span>
                      <p className={styles.processCopy}>{p.copy}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className={styles.waBox}>
                <p className={styles.waCopy}>
                  Would rather just talk it through?
                </p>
                <a
                  href={whatsappLink(
                    "Hello! I would like to discuss a custom analytics project with DataPulse."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.waBtn}
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  Message us on WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
