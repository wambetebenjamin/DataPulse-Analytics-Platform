import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import PricingTable from "@/components/marketing/PricingTable";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import { PLANS, PRICING_FAQ, SITE, whatsappLink } from "@/data/site";
import styles from "@/components/marketing/sections.module.css";
import page from "@/components/marketing/page-header.module.css";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "DataPulse Analytics pricing in Kenyan Shillings. Starter from KES 2,999/month, Business KES 7,999/month with predictive models and WhatsApp reports, plus custom Enterprise plans.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — DataPulse Analytics",
    description:
      "Transparent KES pricing for business intelligence in East Africa. Starter, Business and Enterprise plans with M-Pesa billing and a 14-day free trial.",
    url: "/pricing",
    type: "website",
  },
};

/** Offer + FAQ JSON-LD for the pricing page. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      name: "DataPulse Analytics Platform",
      description: SITE.description,
      brand: { "@type": "Brand", name: SITE.name },
      offers: PLANS.filter((p) => p.monthly !== null).map((p) => ({
        "@type": "Offer",
        name: p.name,
        price: String(p.monthly),
        priceCurrency: "KES",
        availability: "https://schema.org/InStock",
        url: `${SITE.url}/pricing`,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: PRICING_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className={page.header}>
        <div className="dp-container">
          <p className="dp-eyebrow">Pricing</p>
          <h1 className={page.title}>Priced in shillings, for businesses here</h1>
          <p className={page.lede}>
            No dollar invoices, no surprise FX, no enterprise sales cycle before you can see a
            number. Start free for 14 days on the Business plan and pay by M-Pesa when you are
            ready.
          </p>
        </div>
      </header>

      <section className={styles.section} aria-label="Subscription plans">
        <div className="dp-container">
          <PricingTable />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="faq-heading">
        <div className="dp-container">
          <header className={`${styles.head} ${styles.headCenter}`}>
            <p className="dp-eyebrow">Questions</p>
            <h2 id="faq-heading" className={styles.title}>
              Everything people ask before they sign up
            </h2>
          </header>
          <FaqAccordion items={PRICING_FAQ} />
        </div>
      </section>

      <section className={styles.section}>
        <div className="dp-container">
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>Not sure which plan fits?</h2>
            <p className={styles.ctaSub}>
              Tell us your headcount, your data sources and what you need to see every morning.
              We will tell you honestly which plan covers it — including if that is the cheapest
              one.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/contact" className={styles.ctaPrimary}>
                Talk to us
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a
                href={whatsappLink(
                  "Hello! I would like help choosing a DataPulse Analytics plan."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaSecondary}
              >
                <MessageCircle size={16} aria-hidden="true" />
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
