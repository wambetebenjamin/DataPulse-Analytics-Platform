import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, Check } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { SITE } from "@/data/site";
import LoginForm from "./LoginForm";
import styles from "../auth.module.css";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your DataPulse Analytics dashboard.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const POINTS = [
  "Live revenue, sales and inventory in one place",
  "Forecasts with visible confidence bands",
  "Reports delivered on WhatsApp and email",
  "Role-based access for your whole team",
];

export default async function LoginPage() {
  // Already signed in? Go straight to the dashboard.
  const user = await currentUser();
  if (user) redirect("/app/dashboard");

  return (
    <div className={styles.shell}>
      <div className={styles.pane}>
        <div className={styles.card}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <Activity size={18} strokeWidth={2.4} />
            </span>
            {SITE.name}
          </Link>

          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.sub}>
            Sign in to your workspace. Your dashboards are exactly where you left them.
          </p>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          <p className={styles.footNote}>
            No account yet?{" "}
            <Link href="/signup" className={styles.link}>
              Start a free 14-day trial
            </Link>
            . No card required.
          </p>
        </div>
      </div>

      <aside className={styles.aside}>
        <div className={styles.asideInner}>
          <h2 className={styles.asideTitle}>Your numbers, already calculated.</h2>
          <p className={styles.asideCopy}>
            DataPulse keeps running while you are away — syncing M-Pesa, recalculating forecasts
            and watching the alert rules you set.
          </p>
          <ul className={styles.asideList}>
            {POINTS.map((point) => (
              <li className={styles.asideItem} key={point}>
                <span className={styles.asideCheck} aria-hidden="true">
                  <Check size={13} strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <blockquote className={styles.asideQuote}>
            &ldquo;We stopped doing the Monday reporting pack entirely. It is just there now, and
            it is right.&rdquo;
            <p className={styles.asideQuoteBy}>Operations Director, retail group, Nairobi</p>
          </blockquote>
        </div>
      </aside>
    </div>
  );
}
