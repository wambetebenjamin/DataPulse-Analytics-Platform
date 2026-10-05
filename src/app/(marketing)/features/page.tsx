import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Database,
  Minus,
  Plug,
  TrendingUp,
  Users,
} from "lucide-react";
import { ICONS } from "@/components/Icon";
import { FEATURES } from "@/data/site";
import page from "@/components/marketing/page-header.module.css";
import sections from "@/components/marketing/sections.module.css";
import styles from "@/components/marketing/features.module.css";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Every DataPulse capability: real-time revenue dashboards, sales forecasting, customer behaviour analytics, inventory predictions, staff tracking, WhatsApp report delivery and M-Pesa integration.",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "Features — DataPulse Analytics",
    description:
      "Twelve capabilities built for East African operations: live revenue, forecasting, inventory, staff, reporting and integrations.",
    url: "/features",
  },
};

/** Groups map onto the four jobs a DataPulse account actually does. */
const GROUPS = [
  {
    id: "see",
    icon: BarChart3,
    title: "See what is happening right now",
    copy:
      "Live operational truth, not a month-end spreadsheet. Every panel refreshes against your connected sources so the number on screen is the number in the till.",
    features: ["zap", "bar-chart-2", "file-bar-chart"],
  },
  {
    id: "predict",
    icon: TrendingUp,
    title: "Know what happens next",
    copy:
      "Forecasts built from your own trading history using linear regression and moving averages. Every projection is labelled an estimate and carries a visible confidence band.",
    features: ["trending-up", "package", "bed-double"],
  },
  {
    id: "people",
    icon: Users,
    title: "Understand your people",
    copy:
      "Customers, donors, pupils, guests and staff — whoever your organisation serves and employs, measured consistently rather than anecdotally.",
    features: ["users", "clipboard-list", "hand-heart", "graduation-cap"],
  },
  {
    id: "act",
    icon: Plug,
    title: "Act without logging in",
    copy:
      "Reports land on WhatsApp and email on your schedule, and alerts fire the moment a rule you wrote is broken. The dashboard is there when you want detail, not as a daily chore.",
    features: ["message-circle", "database", "shield"],
  },
] as const;

const byIcon = (icon: string) => FEATURES.find((f) => f.icon === icon);

/** Capability matrix — mirrors the plan ladder on /pricing. */
const MATRIX: { capability: string; starter: boolean; business: boolean; enterprise: boolean }[] =
  [
    { capability: "Live revenue & sales dashboards", starter: true, business: true, enterprise: true },
    { capability: "Customer behaviour analytics", starter: true, business: true, enterprise: true },
    { capability: "CSV & PDF export", starter: true, business: true, enterprise: true },
    { capability: "M-Pesa Daraja + Google Sheets", starter: true, business: true, enterprise: true },
    { capability: "Sales & inventory forecasting", starter: false, business: true, enterprise: true },
    { capability: "Scheduled WhatsApp / email reports", starter: false, business: true, enterprise: true },
    { capability: "Custom alert rules", starter: false, business: true, enterprise: true },
    { capability: "Customer map by ward & county", starter: false, business: true, enterprise: true },
    { capability: "Unlimited team seats & custom roles", starter: false, business: false, enterprise: true },
    { capability: "Bespoke models & data engineering", starter: false, business: false, enterprise: true },
    { capability: "Dedicated analyst & onboarding", starter: false, business: false, enterprise: true },
  ];

const INTEGRATIONS = [
  { name: "M-Pesa Daraja", note: "Till, paybill & C2B callbacks", icon: Database },
  { name: "Google Sheets", note: "Two-way sync, any tab", icon: Database },
  { name: "WooCommerce", note: "Orders, products, customers", icon: Database },
  { name: "Shopify", note: "Orders, products, customers", icon: Database },
  { name: "WhatsApp Cloud API", note: "Report & alert delivery", icon: Database },
  { name: "CSV / Excel upload", note: "Legacy systems, one click", icon: Database },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "DataPulse Analytics features",
  itemListElement: FEATURES.map((f, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: f.name,
    description: f.description,
  })),
};

export default function FeaturesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className={page.header}>
        <div className="dp-container">
          <p className="dp-eyebrow">Features</p>
          <h1 className={`${page.title} ${page.titleWide}`}>
            Twelve things your business data should already be telling you
          </h1>
          <p className={page.lede}>
            DataPulse was built in Nairobi for organisations that run on M-Pesa, spreadsheets and
            WhatsApp. Each capability below ships on day one — there is no implementation project
            between you and your first dashboard.
          </p>
          <div className={page.meta}>
            <span>12 capabilities</span>
            <span>6 integrations</span>
            <span>14-day free trial</span>
          </div>
        </div>
      </header>

      <section className={sections.section}>
        <div className="dp-container">
          <div className={styles.groups}>
            {GROUPS.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div className={styles.group} key={group.id} id={group.id}>
                  <div className={styles.groupHead}>
                    <span className={styles.groupIcon} aria-hidden="true">
                      <GroupIcon size={22} strokeWidth={2} />
                    </span>
                    <h2 className={styles.groupTitle}>{group.title}</h2>
                    <p className={styles.groupCopy}>{group.copy}</p>
                  </div>

                  <div className={styles.cards}>
                    {group.features.map((iconKey) => {
                      const feature = byIcon(iconKey);
                      if (!feature) return null;
                      const CardIcon = ICONS[feature.icon] ?? ICONS["bar-chart-2"];
                      return (
                        <article className={styles.card} key={feature.name}>
                          <span className={styles.cardIcon} aria-hidden="true">
                            <CardIcon size={19} strokeWidth={2} />
                          </span>
                          <h3 className={styles.cardTitle}>{feature.name}</h3>
                          <p className={styles.cardCopy}>{feature.description}</p>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={sections.sectionAlt} id="plans">
        <div className="dp-container">
          <div className={sections.head}>
            <p className="dp-eyebrow">What is included where</p>
            <h2 className={sections.title}>Capability by plan</h2>
            <p className={sections.sub}>
              Starter covers a single site that needs to see today clearly. Business adds the
              predictive and automation layer. Enterprise is for groups, chains and institutions
              with their own data team.
            </p>
          </div>

          <div className={styles.matrixWrap}>
            <table className={styles.matrix}>
              <caption className="dp-sr-only">
                DataPulse capabilities available on the Starter, Business and Enterprise plans
              </caption>
              <thead>
                <tr>
                  <th scope="col">Capability</th>
                  <th scope="col" style={{ textAlign: "center" }}>
                    Starter
                  </th>
                  <th scope="col" style={{ textAlign: "center" }}>
                    Business
                  </th>
                  <th scope="col" style={{ textAlign: "center" }}>
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row) => (
                  <tr key={row.capability}>
                    <th scope="row">{row.capability}</th>
                    {[row.starter, row.business, row.enterprise].map((on, i) => (
                      <td key={i}>
                        {on ? (
                          <>
                            <Check size={16} className={styles.yes} aria-hidden="true" />
                            <span className="dp-sr-only">Included</span>
                          </>
                        ) : (
                          <>
                            <Minus size={16} className={styles.no} aria-hidden="true" />
                            <span className="dp-sr-only">Not included</span>
                          </>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={sections.section} id="integrations">
        <div className="dp-container">
          <div className={sections.head}>
            <p className="dp-eyebrow">Integrations</p>
            <h2 className={sections.title}>Connect what you already use</h2>
            <p className={sections.sub}>
              Authenticate once and data flows in on a schedule. Nothing needs to be exported by
              hand, and nothing is written back to your source systems without your say-so.
            </p>
          </div>

          <div className={styles.integrations}>
            {INTEGRATIONS.map((item) => {
              const Icon = item.icon;
              return (
                <div className={styles.integration} key={item.name}>
                  <span className={styles.integrationIcon} aria-hidden="true">
                    <Icon size={17} strokeWidth={2} />
                  </span>
                  <div>
                    <p className={styles.integrationName}>{item.name}</p>
                    <p className={styles.integrationNote}>{item.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={sections.section}>
        <div className="dp-container">
          <div className={sections.cta}>
            <h2 className={sections.ctaTitle}>See all of it running on sample data</h2>
            <p className={sections.ctaSub}>
              The public demo is the same dashboard our customers use, loaded with a fictional
              Nairobi retailer. No account, no card, no sales call.
            </p>
            <div className={sections.ctaRow}>
              <Link href="/demo" className={sections.ctaPrimary}>
                Open the live demo
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/signup" className={sections.ctaSecondary}>
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
