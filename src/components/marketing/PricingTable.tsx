"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, MessageCircle } from "lucide-react";
import { PLANS, whatsappLink } from "@/data/site";
import { usePrefersReducedMotion } from "@/lib/hooks";
import styles from "./pricing.module.css";

/**
 * Pricing cards with a monthly / annual toggle.
 * Brief: "Pricing toggle: price values flip with counter animation."
 * Annual is billed at 10x monthly, i.e. 2 months free.
 */

function AnimatedPrice({ value }: { value: number }) {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      from.current = value;
      return;
    }
    const start = from.current;
    const delta = value - start;
    if (delta === 0) return;
    const duration = 520;
    const t0 = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + delta * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);

  return <>{Intl.NumberFormat("en-KE").format(display)}</>;
}

export default function PricingTable() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <div className={styles.toggleRow}>
        <div className={styles.toggle} role="group" aria-label="Billing period">
          <button
            type="button"
            className={styles.toggleBtn}
            data-active={!annual}
            onClick={() => setAnnual(false)}
            aria-pressed={!annual}
          >
            Monthly
          </button>
          <button
            type="button"
            className={styles.toggleBtn}
            data-active={annual}
            onClick={() => setAnnual(true)}
            aria-pressed={annual}
          >
            Annual
            <span className={styles.saveTag}>2 months free</span>
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {PLANS.map((plan) => {
          const price = annual ? plan.annual : plan.monthly;
          const isEnterprise = price === null;

          return (
            <article
              key={plan.id}
              className={styles.card}
              data-featured={plan.featured}
              aria-labelledby={`plan-${plan.id}`}
            >
              {plan.featured && <span className={styles.ribbon}>Most popular</span>}

              <header className={styles.cardHead}>
                <h3 id={`plan-${plan.id}`} className={styles.planName}>
                  {plan.name}
                </h3>
                <p className={styles.planBlurb}>{plan.blurb}</p>
              </header>

              <div className={styles.priceBlock}>
                {isEnterprise ? (
                  <>
                    <span className={styles.customPrice}>Custom</span>
                    <span className={styles.period}>Tailored to your organisation</span>
                  </>
                ) : (
                  <>
                    <span className={styles.price}>
                      <span className={styles.currency}>KES</span>
                      <span className={styles.amount}>
                        <AnimatedPrice value={price} />
                      </span>
                    </span>
                    <span className={styles.period}>
                      per {annual ? "year" : "month"}
                      {annual && plan.monthly && (
                        <span className={styles.strike}>
                          {" "}
                          was KES {Intl.NumberFormat("en-KE").format(plan.monthly * 12)}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </div>

              {isEnterprise ? (
                <a
                  className={`${styles.cta} ${styles.ctaOutline}`}
                  href={whatsappLink(
                    "Hello! I would like an Enterprise quote for DataPulse Analytics."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={15} aria-hidden="true" />
                  {plan.cta}
                </a>
              ) : (
                <Link
                  href={`/signup?plan=${plan.id}&billing=${annual ? "annual" : "monthly"}`}
                  className={`${styles.cta} ${plan.featured ? styles.ctaFilled : styles.ctaOutline}`}
                >
                  {plan.cta}
                </Link>
              )}

              <ul className={styles.features}>
                {plan.features.map((f) => (
                  <li key={f}>
                    <Check size={15} aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <p className={styles.taxNote}>
        All prices in Kenyan Shillings and exclusive of VAT where applicable. Pay by M-Pesa
        Paybill, card or bank transfer. Upgrade, downgrade or cancel from Settings at any time.
      </p>
    </>
  );
}
