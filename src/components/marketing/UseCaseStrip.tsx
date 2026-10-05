"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { USE_CASES } from "@/data/site";
import Icon from "@/components/Icon";
import { useReveal } from "@/lib/hooks";
import sections from "./sections.module.css";
import styles from "./use-case-strip.module.css";

/** Compact industry grid on the homepage, linking into /use-cases. */
export default function UseCaseStrip() {
  const { ref, visible } = useReveal<HTMLDivElement>(0.08);

  return (
    <section className={`${sections.section} ${sections.sectionAlt}`} aria-labelledby="uc-heading">
      <div className="dp-container">
        <header className={`${sections.head} ${sections.headCenter}`}>
          <p className="dp-eyebrow">Built for your industry</p>
          <h2 id="uc-heading" className={sections.title}>
            Eight industries, eight ready-made dashboards
          </h2>
          <p className={sections.sub}>
            Each one ships with the metrics that sector actually reports on — not a generic
            template you have to bend into shape.
          </p>
        </header>

        <div className={styles.grid} ref={ref}>
          {USE_CASES.map((uc, i) => (
            <Link
              key={uc.slug}
              href={`/use-cases#${uc.slug}`}
              className={`${styles.card} dp-reveal`}
              data-visible={visible}
              style={{ ["--dp-reveal-delay" as string]: `${i * 65}ms` }}
            >
              <span className={styles.icon}>
                <Icon name={uc.icon} size={19} />
              </span>
              <span className={styles.name}>{uc.industry}</span>
              <span className={styles.metrics}>{uc.metrics.length} tracked metrics</span>
              <span className={styles.arrow} aria-hidden="true">
                <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>

        <div className={styles.footer}>
          <Link href="/use-cases" className={styles.allLink}>
            See every use case in detail
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
