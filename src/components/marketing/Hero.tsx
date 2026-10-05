"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, Database, ShieldCheck, Zap } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import DashboardPreview from "./DashboardPreview";
import Globe from "./Globe";
import styles from "./hero.module.css";

const HEADLINE = "Turn Your Business Data Into Decisions.";

/**
 * Hero — split layout.
 * Left: headline + CTAs. Right: animated live dashboard preview + WebGL globe.
 *
 * Brief animation direction: headline enters word by word, 0.09s per word,
 * cubic-bezier(0.25, 1, 0.5, 1).
 */
export default function Hero() {
  const reduced = usePrefersReducedMotion();
  const words = HEADLINE.split(" ");

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      {/* Three.js globe — desktop right side only, behind the preview */}
      <Globe />

      <div className={styles.inner}>
        <div className={styles.left}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            Built in Nairobi for East African business
          </p>

          <h1 id="hero-heading" className={styles.headline}>
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className={styles.word}
                style={
                  reduced
                    ? { opacity: 1, transform: "none", animation: "none" }
                    : { animationDelay: `${i * 0.09}s` }
                }
              >
                {word}
                {i < words.length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </h1>

          <p className={styles.sub}>
            Real-time analytics, predictive insights, and custom dashboards for East African
            businesses.
          </p>

          <div className={styles.ctas}>
            <Link href="/signup" className={styles.primaryCta}>
              Start Free Trial
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/contact?intent=demo" className={styles.secondaryCta}>
              <CalendarCheck size={16} aria-hidden="true" />
              Book a Demo
            </Link>
          </div>

          <ul className={styles.trust}>
            <li>
              <Zap size={15} aria-hidden="true" />
              Live M-Pesa data
            </li>
            <li>
              <Database size={15} aria-hidden="true" />
              Sheets &amp; POS imports
            </li>
            <li>
              <ShieldCheck size={15} aria-hidden="true" />
              DPA 2019 compliant
            </li>
          </ul>

          <p className={styles.microcopy}>
            14-day free trial on the Business plan. No card required. Cancel any time.
          </p>
        </div>

        <div className={styles.right}>
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
