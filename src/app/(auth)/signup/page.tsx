import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, Check } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { PLANS, SITE } from "@/data/site";
import SignupForm from "./SignupForm";
import styles from "../auth.module.css";

export const metadata: Metadata = {
  title: "Start your free trial",
  description:
    "Create a DataPulse Analytics workspace. Fourteen days free, no card required, M-Pesa billing when you are ready.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const POINTS = [
  "Fourteen days free — no card, no sales call",
  "Connect M-Pesa and Google Sheets in minutes",
  "Dashboards live the same afternoon",
  "Cancel from Settings at any time",
];

export default async function SignupPage({
  searchParams,
}: {
  searchParams: { plan?: string; billing?: string };
}) {
  const user = await currentUser();
  if (user) redirect("/app/dashboard");

  const plan = PLANS.find((p) => p.id === searchParams.plan);
  const annual = searchParams.billing === "annual";

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

          {plan ? (
            <span className={styles.planTag}>
              {plan.name} plan · {annual ? "billed annually" : "billed monthly"}
            </span>
          ) : null}

          <h1 className={styles.title}>Start your free trial</h1>
          <p className={styles.sub}>
            Fourteen days of the full platform. No card required, and nothing renews unless you
            choose a plan at the end.
          </p>

          <Suspense fallback={null}>
            <SignupForm />
          </Suspense>

          <p className={styles.footNote}>
            Already have a workspace?{" "}
            <Link href="/login" className={styles.link}>
              Sign in
            </Link>
            .
          </p>
        </div>
      </div>

      <aside className={styles.aside}>
        <div className={styles.asideInner}>
          <h2 className={styles.asideTitle}>
            {plan
              ? `${plan.name}: ${plan.blurb}`
              : "Turn your business data into decisions."}
          </h2>
          <p className={styles.asideCopy}>
            Real-time analytics, predictive insights and custom dashboards, built in Nairobi for
            East African organisations.
          </p>
          <ul className={styles.asideList}>
            {(plan?.features.slice(0, 5) ?? POINTS).map((point) => (
              <li className={styles.asideItem} key={point}>
                <span className={styles.asideCheck} aria-hidden="true">
                  <Check size={13} strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <blockquote className={styles.asideQuote}>
            &ldquo;Setup took an afternoon. The stock-out alerts alone paid for the year.&rdquo;
            <p className={styles.asideQuoteBy}>Founder, pharmacy chain, Mombasa</p>
          </blockquote>
        </div>
      </aside>
    </div>
  );
}
