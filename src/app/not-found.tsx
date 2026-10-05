import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  LayoutDashboard,
  LineChart,
  Package,
  Users,
} from "lucide-react";
import styles from "./error-pages.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This dashboard or page was not found.",
  robots: { index: false, follow: false },
};

/** Feature quick links, per the brief's 404 specification. */
const QUICK_LINKS = [
  {
    href: "/demo",
    icon: LayoutDashboard,
    name: "Live demo dashboard",
    note: "The full product running on sample data",
  },
  {
    href: "/features",
    icon: BarChart3,
    name: "Features",
    note: "Every capability, grouped by the job it does",
  },
  {
    href: "/features#predict",
    icon: LineChart,
    name: "Forecasting",
    note: "30, 60 and 90-day projections with confidence bands",
  },
  {
    href: "/use-cases",
    icon: Users,
    name: "Use cases",
    note: "Eight industries, with the metrics that matter in each",
  },
  {
    href: "/pricing",
    icon: Package,
    name: "Pricing",
    note: "Starter, Business and Enterprise plans in KES",
  },
  {
    href: "/blog",
    icon: BookOpen,
    name: "Blog",
    note: "Monthly data insights for East African businesses",
  },
];

export default function NotFound() {
  return (
    <main className={styles.wrap}>
      <div className={styles.inner}>
        <span className={styles.code}>
          <AlertCircle size={13} aria-hidden="true" />
          Error 404
        </span>

        <h1 className={styles.title}>This dashboard or page was not found.</h1>
        <p className={styles.lede}>
          The link may be out of date, the panel may have been renamed, or the workspace you are
          looking for may belong to a different account. Nothing is broken — this address simply
          does not exist.
        </p>

        <div className={styles.actions}>
          <Link href="/app/dashboard" className={styles.primary}>
            Go to Dashboard Home
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/" className={styles.secondary}>
            Back to homepage
          </Link>
        </div>

        <p className={styles.linksLabel}>Or jump straight to</p>
        <div className={styles.links}>
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.href} className={styles.link}>
                <span className={styles.linkIcon} aria-hidden="true">
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span>
                  <span className={styles.linkName}>{item.name}</span>
                  <span className={styles.linkNote}>{item.note}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
