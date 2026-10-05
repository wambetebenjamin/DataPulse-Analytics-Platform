import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Lock, MapPin, Scale } from "lucide-react";
import { SITE } from "@/data/site";
import { resolveImage } from "@/lib/images";
import page from "@/components/marketing/page-header.module.css";
import sections from "@/components/marketing/sections.module.css";
import styles from "@/components/marketing/about.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "DataPulse Analytics is a Nairobi-based business intelligence company building dashboards, forecasting and custom analytics for East African SMEs, NGOs, schools, hotels and government.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — DataPulse Analytics",
    description:
      "Built in Nairobi for East African organisations. Our story, our values and the team behind the platform.",
    url: "/about",
  },
};

const VALUES = [
  {
    icon: Eye,
    title: "Plain numbers, plainly shown",
    copy:
      "No vanity metrics and no mystery scores. Every figure has a stated definition and a 'How is this calculated?' expander next to it.",
  },
  {
    icon: Lock,
    title: "Your data stays yours",
    copy:
      "You own everything you upload. We process it to run your dashboards, we never sell it, and you can export or delete it at any time.",
  },
  {
    icon: MapPin,
    title: "Built for how business runs here",
    copy:
      "M-Pesa first, WhatsApp first, intermittent connectivity assumed. Features that work in Westlands also work in Kisii.",
  },
  {
    icon: Scale,
    title: "Honest about uncertainty",
    copy:
      "Forecasts are labelled estimates and shipped with a confidence band. We would rather show the range than fake a decimal point.",
  },
];

const MILESTONES = [
  {
    year: "2021",
    title: "A spreadsheet that would not close",
    copy:
      "We were consulting for a Nairobi retail chain whose monthly reporting pack took eleven days to assemble and was obsolete the day it landed. The first version of DataPulse was a single live revenue screen built to replace it.",
  },
  {
    year: "2022",
    title: "M-Pesa Daraja integration",
    copy:
      "Till and paybill transactions started flowing in automatically. Reconciliation stopped being a Monday morning job and the product found its shape: operational data, not accounting data.",
  },
  {
    year: "2023",
    title: "WhatsApp report delivery",
    copy:
      "Owners told us plainly that they would not log in every day. So we stopped asking them to. Scheduled reports now arrive where the conversation already happens.",
  },
  {
    year: "2024",
    title: "Forecasting and custom analytics",
    copy:
      "Regression-based projections with confidence bands, stock-out prediction, and a dedicated custom engagement team for organisations with data that does not fit a template.",
  },
  {
    year: "2026",
    title: "Serving six sectors across East Africa",
    copy:
      "Retail, hospitality, education, health, professional services and the non-profit sector — in Kenya, Uganda, Tanzania, Rwanda and Ethiopia.",
  },
];

const TEAM = [
  {
    initials: "WM",
    name: "Wanjiru Mwangi",
    role: "Founder & CEO",
    bio: "Fifteen years in retail operations and supply chain across Kenya and Tanzania. Built the first DataPulse dashboard for her own employer.",
  },
  {
    initials: "OO",
    name: "Otieno Ochieng",
    role: "Head of Engineering",
    bio: "Payments and integrations. Owns the Daraja pipeline and the reliability of everything that writes to your dashboard.",
  },
  {
    initials: "AH",
    name: "Amina Hassan",
    role: "Lead Data Scientist",
    bio: "Forecasting, churn and stock-out models. Insists every prediction ships with its error bars attached.",
  },
  {
    initials: "DK",
    name: "David Kiprono",
    role: "Head of Customer Success",
    bio: "Onboarding, training and custom engagements. Spends most of the week in client back offices, not ours.",
  },
];

const FACTS = [
  { value: "480+", label: "Organisations onboarded" },
  { value: "5", label: "Countries served" },
  { value: "2.4M", label: "Transactions processed monthly" },
  { value: "99.9%", label: "Platform uptime, trailing 12 months" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: `About ${SITE.name}`,
  url: `${SITE.url}/about`,
  mainEntity: {
    "@type": "Organization",
    name: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    telephone: `+${SITE.phone}`,
    foundingDate: "2021",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Chania Avenue, Kilimani",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    employee: TEAM.map((m) => ({
      "@type": "Person",
      name: m.name,
      jobTitle: m.role,
    })),
  },
};

export default function AboutPage() {
  const team = resolveImage("about/team");
  const office = resolveImage("about/office");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className={page.header}>
        <div className="dp-container">
          <p className="dp-eyebrow">About us</p>
          <h1 className={`${page.title} ${page.titleWide}`}>
            We build the reporting layer East African businesses never had time to build
          </h1>
          <p className={page.lede}>
            DataPulse Analytics is a Kenyan company headquartered in Nairobi. We make business
            intelligence that assumes M-Pesa, WhatsApp and a finance team of one — because that is
            the reality for most of the organisations we serve.
          </p>
        </div>
      </header>

      <section className={sections.section}>
        <div className="dp-container">
          <div className={styles.intro}>
            <div className={styles.introCopy}>
              <h2>Started by operators, not by a data team</h2>
              <p>
                Most analytics platforms are designed for companies that already employ analysts.
                They assume a warehouse, a modelling layer and somebody whose job it is to maintain
                both. The businesses we grew up around have none of that. They have a till, a
                paybill number, three spreadsheets and an owner who needs to know by Tuesday whether
                the Mombasa branch is actually profitable.
              </p>
              <p>
                So we built the opposite thing. Connect your sources, and the dashboards are live
                the same afternoon. The models that matter — forecasting, churn risk, days to
                stock-out — run on your history without anyone configuring a pipeline. And when the
                answer genuinely needs bespoke work, our custom analytics team does that as a
                defined engagement rather than an open-ended consulting retainer.
              </p>
              <p>
                We are deliberately conservative about what we claim. Predictions are labelled
                estimates, confidence bands are always drawn, and every calculated metric can be
                expanded to show its formula. Trust in the number is the entire product.
              </p>
            </div>

            <figure className={styles.photo}>
              <Image
                src={team.src}
                alt="The DataPulse Analytics team reviewing dashboards together in the Nairobi office"
                width={880}
                height={660}
                priority={false}
              />
              {team.isPlaceholder ? (
                <figcaption className={styles.photoCaption}>
                  Photography pending — see image-credits.md
                </figcaption>
              ) : null}
            </figure>
          </div>
        </div>
      </section>

      <section className={sections.sectionAlt}>
        <div className="dp-container">
          <div className={sections.head}>
            <p className="dp-eyebrow">What we hold to</p>
            <h2 className={sections.title}>Four things we will not trade away</h2>
          </div>
          <div className={styles.values}>
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <article className={styles.value} key={value.title}>
                  <span className={styles.valueIcon} aria-hidden="true">
                    <Icon size={19} strokeWidth={2} />
                  </span>
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                  <p className={styles.valueCopy}>{value.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={sections.section}>
        <div className="dp-container">
          <div className={styles.intro}>
            <div>
              <p className="dp-eyebrow">Our story</p>
              <h2 className={sections.title} style={{ marginBottom: 28 }}>
                From one stubborn spreadsheet to five countries
              </h2>
              <ol className={styles.timeline}>
                {MILESTONES.map((m) => (
                  <li className={styles.milestone} key={m.year}>
                    <p className={styles.milestoneYear}>{m.year}</p>
                    <h3 className={styles.milestoneTitle}>{m.title}</h3>
                    <p className={styles.milestoneCopy}>{m.copy}</p>
                  </li>
                ))}
              </ol>
            </div>

            <figure className={styles.photo}>
              <Image
                src={office.src}
                alt="The DataPulse Analytics office in Kilimani, Nairobi"
                width={880}
                height={660}
              />
              {office.isPlaceholder ? (
                <figcaption className={styles.photoCaption}>
                  Photography pending — see image-credits.md
                </figcaption>
              ) : null}
            </figure>
          </div>
        </div>
      </section>

      <section className={sections.sectionDark}>
        <div className="dp-container">
          <div className={styles.facts}>
            {FACTS.map((fact) => (
              <div className={styles.fact} key={fact.label}>
                <p className={styles.factValue}>{fact.value}</p>
                <p className={styles.factLabel}>{fact.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={sections.section}>
        <div className="dp-container">
          <div className={sections.head}>
            <p className="dp-eyebrow">The team</p>
            <h2 className={sections.title}>Who you will actually deal with</h2>
            <p className={sections.sub}>
              A small team in Kilimani, Nairobi. Support is handled by the people who built the
              thing you are asking about.
            </p>
          </div>
          <div className={styles.team}>
            {TEAM.map((member) => (
              <article className={styles.member} key={member.name}>
                <span className={styles.avatar} aria-hidden="true">
                  {member.initials}
                </span>
                <h3 className={styles.memberName}>{member.name}</h3>
                <p className={styles.memberRole}>{member.role}</p>
                <p className={styles.memberBio}>{member.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={sections.section}>
        <div className="dp-container">
          <div className={sections.cta}>
            <h2 className={sections.ctaTitle}>Come and see what your data says</h2>
            <p className={sections.ctaSub}>
              Fourteen days free, no card required. Or talk to us first — we would rather understand
              the problem than demo a feature list.
            </p>
            <div className={sections.ctaRow}>
              <Link href="/signup" className={sections.ctaPrimary}>
                Start free trial
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/contact" className={sections.ctaSecondary}>
                Talk to the team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
