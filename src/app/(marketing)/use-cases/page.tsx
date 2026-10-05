import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import UseCaseSection from "@/components/marketing/UseCaseSection";
import { SITE, USE_CASES } from "@/data/site";
import { resolveImage } from "@/lib/images";
import styles from "@/components/marketing/sections.module.css";
import page from "@/components/marketing/page-header.module.css";

export const metadata: Metadata = {
  title: "Use Cases",
  description:
    "How DataPulse Analytics works for retail, hotels, schools, NGOs, clinics, restaurants, law firms and real estate agencies across East Africa — with the metrics each sector actually reports on.",
  alternates: { canonical: "/use-cases" },
  openGraph: {
    title: "Use Cases — DataPulse Analytics",
    description:
      "Eight industry dashboards built for East African organisations: retail, hospitality, education, NGOs, healthcare, food service, legal and real estate.",
    url: "/use-cases",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "DataPulse Analytics use cases",
  itemListElement: USE_CASES.map((uc, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: uc.industry,
    description: uc.solution,
    url: `${SITE.url}/use-cases#${uc.slug}`,
  })),
};

export default function UseCasesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className={page.header}>
        <div className="dp-container">
          <p className="dp-eyebrow">Use cases</p>
          <h1 className={`${page.title} ${page.titleWide}`}>
            The same platform. Eight very different Mondays.
          </h1>
          <p className={page.lede}>
            A hotel revenue manager and a school bursar do not need the same chart. Every DataPulse
            dashboard ships pre-configured with the metrics that sector genuinely reports on — so
            the first screen you open already makes sense.
          </p>
          <nav className={page.meta} aria-label="Jump to an industry">
            {USE_CASES.map((uc) => (
              <Link key={uc.slug} href={`#${uc.slug}`}>
                {uc.industry}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {USE_CASES.map((uc, i) => (
        <UseCaseSection
          key={uc.slug}
          useCase={uc}
          index={i}
          image={resolveImage(`use-cases/${mapSlug(uc.slug)}`).src}
        />
      ))}

      <section className={styles.section}>
        <div className="dp-container">
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>Your industry not listed?</h2>
            <p className={styles.ctaSub}>
              Manufacturing, logistics, SACCOs, county government, agriculture — if it produces
              data, we have probably built a dashboard for it. Tell us what you need and we will
              scope it.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/custom" className={styles.ctaPrimary}>
                Request a custom dashboard
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/demo" className={styles.ctaSecondary}>
                Explore the live demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Map a use-case slug to its image file stem. */
function mapSlug(slug: string): string {
  const map: Record<string, string> = {
    "retail-ecommerce": "retail",
    "hotels-hospitality": "hospitality",
    "schools-education": "education",
    "ngos-charities": "ngo",
    "clinics-pharmacies": "clinic",
    "restaurants-food": "restaurant",
    "law-firms": "lawfirm",
    "real-estate": "realestate",
  };
  return map[slug] ?? "retail";
}
