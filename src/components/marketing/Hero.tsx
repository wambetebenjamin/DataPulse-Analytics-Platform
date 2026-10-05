"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, Database, ShieldCheck, Zap } from "lucide-react";
import DashboardPreview from "./DashboardPreview";
import styles from "./hero.module.css";

const HEADLINE = "Turn Your Business Data Into Decisions.";

/**
 * Hero — split layout.
 * Left: headline + CTAs. Right: live dashboard preview.
 *
 * Deliberately plain: no gradient wash, no animated globe, no word-by-word
 * headline. The product screenshot is the visual; the copy does the talking.
 */
export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.inner}>
        <div className={styles.left}>
          <p className={styles.eyebrow}>Built in Nairobi for East African business</p>

          <h1 id="hero-heading" className={styles.headline}>
            Turn Your Business Data Into{" "}
            <span className={styles.headlineAccent}>Decisions.</span>
          </h1>

          <p className={styles.sub}>
            Real-time analytics, predictive insights, and custom dashboards for East African
            businesses.
          </p>

          <div className={styles.ctas}>
            <Link href="/app/dashboard" className={styles.primaryCta}>
              Try the dashboard free
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
            Every category is free to try once — no account needed. Sign in when you want more.
          </p>
        </div>

        <div className={styles.right}>
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
