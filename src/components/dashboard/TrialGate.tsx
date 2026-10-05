"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Lock, Sparkles } from "lucide-react";
import { DASHBOARD_TABS } from "@/data/site";
import styles from "./trial.module.css";

/**
 * Trial gate — "try every category once, then sign in".
 *
 * The dashboard is open to anonymous visitors. Each of the ten categories can
 * be viewed once per browser; after that the category is locked behind a
 * sign-in prompt. Signed-in users bypass the gate entirely (their access is
 * role-based, as before). Tracking is client-side localStorage — this is a
 * demo convenience, not a security boundary; the server still enforces
 * authentication on every write endpoint.
 */

const STORAGE_KEY = "datapulse.trial.used";

export function readTrialUsed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((k) => typeof k === "string") : [];
  } catch {
    return [];
  }
}

function markTrialUsed(tabKey: string): string[] {
  const used = readTrialUsed();
  if (!used.includes(tabKey)) used.push(tabKey);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(used));
  } catch {
    /* private browsing — the trial simply does not persist */
  }
  window.dispatchEvent(new CustomEvent("datapulse:trial"));
  return used;
}

export default function TrialGate({
  tabKey,
  children,
}: {
  tabKey: string;
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const pathname = usePathname();
  const [state, setState] = useState<"pending" | "trial" | "locked">("pending");
  const [usedCount, setUsedCount] = useState(0);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      setState("trial"); // signed in — children render, no banner needed
      return;
    }

    if (readTrialUsed().includes(tabKey)) {
      setState("locked");
    } else {
      markTrialUsed(tabKey);
      setState("trial");
    }
    setUsedCount(readTrialUsed().length);
  }, [status, tabKey]);

  const tab = DASHBOARD_TABS.find((t) => t.key === tabKey);
  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname)}`;

  const remaining = useMemo(
    () => DASHBOARD_TABS.filter((t) => !readTrialUsed().includes(t.key)),
    [state]
  );

  /* ---------- locked: this category's free view is spent ---------- */
  if (state === "locked") {
    return (
      <section className={styles.locked} aria-labelledby="trial-locked-heading">
        <span className={styles.lockIcon} aria-hidden="true">
          <Lock size={22} strokeWidth={2} />
        </span>
        <h2 id="trial-locked-heading" className={styles.lockTitle}>
          You have already used your free {tab?.label ?? "category"} preview
        </h2>
        <p className={styles.lockCopy}>
          Every category is free to try once. Sign in to keep using{" "}
          {tab?.label ?? "this category"} — or open a category you have not tried yet.
        </p>
        <div className={styles.lockActions}>
          <Link href={loginHref} className={styles.lockPrimary}>
            Sign in
          </Link>
          <Link href="/signup" className={styles.lockSecondary}>
            Create a free account
          </Link>
        </div>

        {remaining.length > 0 ? (
          <div className={styles.remaining}>
            <p className={styles.remainingLabel}>Still free to try</p>
            <ul>
              {remaining.slice(0, 8).map((t) => (
                <li key={t.key}>
                  <Link
                    href={t.key === "overview" ? "/app/dashboard" : `/app/dashboard/${t.key}`}
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className={styles.allUsed}>
            You have tried every category. Sign in to explore them all — the demo
            accounts on the login page are open to use.
          </p>
        )}
      </section>
    );
  }

  /* ---------- trial (anonymous, first view) or signed in ---------- */
  return (
    <>
      {state === "trial" && status === "unauthenticated" ? (
        <aside className={styles.banner} role="status">
          <Sparkles size={14} aria-hidden="true" />
          <span>
            Free preview of <strong>{tab?.label ?? "this category"}</strong> —{" "}
            {usedCount} of {DASHBOARD_TABS.length} categories used. It is now spent for
            this browser.
          </span>
          <Link href={loginHref}>Sign in to unlock everything</Link>
        </aside>
      ) : null}
      {children}
    </>
  );
}
