"use client";

import { FEATURES } from "@/data/site";
import Icon from "@/components/Icon";
import { useReveal } from "@/lib/hooks";
import styles from "./features.module.css";

/**
 * Features grid.
 * Brief: 6-column icon grid on desktop, 2-column on mobile.
 * Stagger fade up on scroll, 65ms apart. Hover: card lifts, icon animates.
 */
export default function Features() {
  const { ref, visible } = useReveal<HTMLDivElement>(0.08);

  return (
    <section className={styles.section} id="features" aria-labelledby="features-heading">
      <div className="dp-container">
        <header className={styles.head}>
          <p className="dp-eyebrow">Everything in one platform</p>
          <h2 id="features-heading" className={styles.title}>
            The metrics your business actually runs on
          </h2>
          <p className={styles.sub}>
            Twelve capabilities built for how East African organisations really work — M-Pesa
            first, WhatsApp native, and ready for the questions your board asks on Monday morning.
          </p>
        </header>

        <div className={styles.grid} ref={ref}>
          {FEATURES.map((feature, i) => (
            <article
              key={feature.name}
              className={`${styles.card} dp-reveal`}
              data-visible={visible}
              style={{ ["--dp-reveal-delay" as string]: `${i * 65}ms` }}
            >
              <span className={styles.iconWrap}>
                <Icon name={feature.icon} size={20} />
              </span>
              <h3 className={styles.cardTitle}>{feature.name}</h3>
              <p className={styles.cardCopy}>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
