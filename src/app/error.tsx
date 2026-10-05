"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, RefreshCw } from "lucide-react";
import { SITE } from "@/data/site";
import styles from "./error-pages.module.css";

/**
 * Route-level 500 boundary. Copy is fixed by the brief:
 * "Dashboard temporarily unavailable. We are restoring services."
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for the platform log drain; never render the raw message, which
    // can contain query fragments or identifiers.
    console.error("[datapulse] unhandled route error", error);
  }, [error]);

  return (
    <main className={styles.wrap}>
      <div className={styles.inner}>
        <span className={`${styles.code} ${styles.codeError}`}>
          <AlertTriangle size={13} aria-hidden="true" />
          Error 500
        </span>

        <h1 className={styles.title}>Dashboard temporarily unavailable.</h1>
        <p className={styles.lede}>
          We are restoring services. Your data is safe and nothing you saved has been lost — this
          is a fault on our side while rendering the page. Try again in a moment, or check the
          status page for live updates.
        </p>

        <div className={styles.actions}>
          <button type="button" onClick={reset} className={styles.primary}>
            <RefreshCw size={16} aria-hidden="true" />
            Try again
          </button>
          <a
            href={SITE.statusUrl}
            className={styles.secondary}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Activity size={16} aria-hidden="true" />
            View system status
          </a>
          <Link href="/" className={styles.secondary}>
            Back to homepage
          </Link>
        </div>

        <div className={styles.status}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span>
            Live platform status is published at{" "}
            <a href={SITE.statusUrl} rel="noopener noreferrer" target="_blank">
              {SITE.statusUrl.replace("https://", "")}
            </a>
            . Urgent issues:{" "}
            <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> or{" "}
            <a href={`tel:+${SITE.phone}`}>{SITE.phoneDisplay}</a>.
          </span>
        </div>

        {error.digest ? (
          <p className={styles.digest}>
            Reference: {error.digest} — quote this if you contact support.
          </p>
        ) : null}
      </div>
    </main>
  );
}
