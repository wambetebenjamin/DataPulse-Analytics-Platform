import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE } from "@/data/site";
import page from "./page-header.module.css";
import sections from "./sections.module.css";
import styles from "./legal.module.css";

export interface LegalSection {
  id: string;
  label: string;
}

/**
 * Shared frame for the three legal documents: header band, sticky table of
 * contents built from the section list, the document body, and cross-links.
 */
export default function LegalShell({
  title,
  lede,
  updated,
  effective,
  toc,
  children,
}: {
  title: string;
  lede: string;
  /** Human-readable last-updated date. */
  updated: string;
  /** ISO date for <time dateTime>. */
  effective: string;
  toc: LegalSection[];
  children: ReactNode;
}) {
  return (
    <>
      <header className={page.header}>
        <div className="dp-container">
          <nav className={page.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span>Legal</span>
          </nav>
          <h1 className={`${page.title} ${page.titleWide}`}>{title}</h1>
          <p className={page.lede}>{lede}</p>
          <div className={page.meta}>
            <span>
              Last updated <time dateTime={effective}>{updated}</time>
            </span>
            <span>Governed by the laws of Kenya</span>
          </div>
        </div>
      </header>

      <section className={sections.section}>
        <div className="dp-container">
          <div className={styles.layout}>
            <nav className={styles.toc} aria-label="On this page">
              <p className={styles.tocLabel}>On this page</p>
              <div className={styles.tocList}>
                {toc.map((item) => (
                  <a className={styles.tocLink} href={`#${item.id}`} key={item.id}>
                    {item.label}
                  </a>
                ))}
              </div>
            </nav>

            <div className={styles.doc}>
              {children}

              <div className={styles.contactCard}>
                <h3>Questions about this document?</h3>
                <p>
                  Write to <a href={`mailto:${SITE.dpoEmail}`}>{SITE.dpoEmail}</a> for data
                  protection matters, or{" "}
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a> for anything else.{" "}
                  {SITE.legalName}, {SITE.address}. Telephone{" "}
                  <a href={`tel:+${SITE.phone}`}>{SITE.phoneDisplay}</a>.
                </p>
              </div>

              <div className={styles.docFooterNav}>
                <Link href="/legal/privacy-policy">Privacy Policy</Link>
                <Link href="/legal/terms">Terms of Service</Link>
                <Link href="/legal/cookie-policy">Cookie Policy</Link>
                <Link href="/contact">Contact us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export { styles as legalStyles };
