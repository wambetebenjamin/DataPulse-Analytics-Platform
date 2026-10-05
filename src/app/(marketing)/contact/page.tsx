import type { Metadata } from "next";
import { CalendarCheck, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { SITE, WHATSAPP_LINK } from "@/data/site";
import page from "@/components/marketing/page-header.module.css";
import styles from "@/components/marketing/contact.module.css";

export const metadata: Metadata = {
  title: "Contact & Demo Booking",
  description:
    "Book a DataPulse Analytics demo or send a general enquiry. Based in Kilimani, Nairobi, serving businesses, NGOs, schools and government agencies across East Africa.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact DataPulse Analytics",
    description:
      "Book a product demo or ask us anything about business intelligence for East African organisations.",
    url: "/contact",
  },
};

export default function ContactPage({
  searchParams,
}: {
  searchParams: { intent?: string };
}) {
  const isDemo = searchParams.intent === "demo";

  return (
    <>
      <header className={page.header}>
        <div className="dp-container">
          <p className="dp-eyebrow">{isDemo ? "Book a demo" : "Contact"}</p>
          <h1 className={page.title}>
            {isDemo ? "See DataPulse on your own numbers" : "Talk to a human in Nairobi"}
          </h1>
          <p className={page.lede}>
            {isDemo
              ? "A 30-minute call where we load a sample of your actual data and show you the dashboard it produces. No slides, no generic deck."
              : "Questions about plans, integrations, data protection or a bespoke build — we answer within one business day, usually much sooner."}
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <div className="dp-container">
          <div className={styles.grid}>
            <div className={styles.formCol}>
              <h2 className={styles.formTitle}>Send us a message</h2>
              <ContactForm defaultSubject={isDemo ? "Book a product demo" : undefined} />
            </div>

            <aside className={styles.aside}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Reach us directly</h2>
                <ul className={styles.contactList}>
                  <li>
                    <span className={styles.contactIcon}>
                      <MessageCircle size={16} />
                    </span>
                    <div>
                      <span className={styles.contactLabel}>WhatsApp</span>
                      <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contactValue}
                      >
                        {SITE.phoneDisplay}
                      </a>
                      <span className={styles.contactNote}>Fastest route — usually under an hour</span>
                    </div>
                  </li>
                  <li>
                    <span className={styles.contactIcon}>
                      <Mail size={16} />
                    </span>
                    <div>
                      <span className={styles.contactLabel}>Email</span>
                      <a href={`mailto:${SITE.email}`} className={styles.contactValue}>
                        {SITE.email}
                      </a>
                      <span className={styles.contactNote}>
                        Support: {SITE.supportEmail}
                      </span>
                    </div>
                  </li>
                  <li>
                    <span className={styles.contactIcon}>
                      <Phone size={16} />
                    </span>
                    <div>
                      <span className={styles.contactLabel}>Phone</span>
                      <a href={`tel:+${SITE.phone}`} className={styles.contactValue}>
                        {SITE.phoneDisplay}
                      </a>
                    </div>
                  </li>
                  <li>
                    <span className={styles.contactIcon}>
                      <MapPin size={16} />
                    </span>
                    <div>
                      <span className={styles.contactLabel}>Office</span>
                      <span className={styles.contactValue}>{SITE.address}</span>
                      <span className={styles.contactNote}>Visits by appointment</span>
                    </div>
                  </li>
                  <li>
                    <span className={styles.contactIcon}>
                      <Clock size={16} />
                    </span>
                    <div>
                      <span className={styles.contactLabel}>Hours</span>
                      <span className={styles.contactValue}>Mon–Fri, 08:00–18:00 EAT</span>
                      <span className={styles.contactNote}>
                        Saturday 09:00–13:00 for support tickets
                      </span>
                    </div>
                  </li>
                </ul>

                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.waBtn}
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  Chat on WhatsApp
                </a>
              </div>

              <div className={`${styles.card} ${styles.demoCard}`}>
                <span className={styles.demoIcon}>
                  <CalendarCheck size={18} />
                </span>
                <h2 className={styles.cardTitle}>Prefer to look first?</h2>
                <p className={styles.demoCopy}>
                  The live demo is public — no login, no card, real East African sample data
                  across revenue, funnel, products, acquisition and alerts.
                </p>
                <a href="/demo" className={styles.demoLink}>
                  Open the live demo →
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
