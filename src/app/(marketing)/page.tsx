import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MessageCircle } from "lucide-react";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import UseCaseStrip from "@/components/marketing/UseCaseStrip";
import NewsletterForm from "@/components/forms/NewsletterForm";
import { SITE, WHATSAPP_LINK } from "@/data/site";
import styles from "@/components/marketing/sections.module.css";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: "/",
  },
};

const STATS = [
  { value: "KES 4.2B+", label: "Transaction value analysed across client dashboards" },
  { value: "480+", label: "Businesses, NGOs and schools running on DataPulse" },
  { value: "6 min", label: "Average time from M-Pesa connection to first dashboard" },
  { value: "99.9%", label: "Platform uptime over the last twelve months" },
];

const STEPS = [
  {
    title: "Connect your data",
    copy: "Link M-Pesa Daraja, a Google Sheet, your POS export or a custom API. Most businesses are connected inside ten minutes.",
  },
  {
    title: "Pick your dashboard",
    copy: "Choose the template built for your industry — retail, hospitality, schools, NGOs, clinics — or ask us to build you a bespoke one.",
  },
  {
    title: "Set your alerts",
    copy: "Tell DataPulse what matters. Revenue below a floor, stock under a threshold, a customer going quiet. We watch so you do not have to.",
  },
  {
    title: "Get the answer daily",
    copy: "Your numbers land on WhatsApp and email every morning, with the forecast for the month attached. No login required to read them.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />

      {/* ---------- how it works ---------- */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="how-heading">
        <div className="dp-container">
          <header className={`${styles.head} ${styles.headCenter}`}>
            <p className="dp-eyebrow">From spreadsheet to decision</p>
            <h2 id="how-heading" className={styles.title}>
              Four steps to running your business on evidence
            </h2>
            <p className={styles.sub}>
              No data team, no migration project, no six-month implementation. Most DataPulse
              clients see their first real dashboard the same afternoon they sign up.
            </p>
          </header>

          <ol className={styles.steps}>
            {STEPS.map((step, i) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNum}>{i + 1}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepCopy}>{step.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- stats ---------- */}
      <section className={`${styles.section} ${styles.sectionDark}`} aria-labelledby="stats-heading">
        <div className="dp-container">
          <header className={`${styles.head} ${styles.headCenter}`}>
            <p className="dp-eyebrow">The numbers behind the numbers</p>
            <h2 id="stats-heading" className={styles.title}>
              Trusted across East Africa
            </h2>
          </header>
          <div className={styles.stats}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <UseCaseStrip />

      {/* ---------- newsletter ---------- */}
      <section className={styles.section} aria-labelledby="news-heading">
        <div className="dp-container">
          <div className={styles.newsBand}>
            <div>
              <h2 id="news-heading" className={styles.newsTitle}>
                Monthly data insights for East African businesses
              </h2>
              <p className={styles.newsCopy}>
                One email a month: a practical analytics guide, a real client teardown, and the
                market numbers worth knowing. Written in Nairobi, no filler, unsubscribe any time.
              </p>
            </div>
            <NewsletterForm variant="section" />
          </div>
        </div>
      </section>

      {/* ---------- final CTA ---------- */}
      <section className={styles.section} aria-labelledby="cta-heading">
        <div className="dp-container">
          <div className={styles.cta}>
            <h2 id="cta-heading" className={styles.ctaTitle}>
              Stop guessing. Start deciding.
            </h2>
            <p className={styles.ctaSub}>
              Open the full dashboard right now — every category is free to try once, no account
              needed. Sign in when you want more; the demo accounts are open to use.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/app/dashboard" className={styles.ctaPrimary}>
                Open the Dashboard
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/demo" className={styles.ctaSecondary}>
                Explore the Guided Demo
              </Link>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaSecondary}
              >
                <MessageCircle size={16} aria-hidden="true" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
