"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./loading-screen.module.css";

/**
 * Loading screen.
 *
 * The design source zip contains NO loading screen of any kind
 * (DESIGN-SOURCE-AUDIT.md §7 — exhaustive grep returned one unrelated MUI
 * autocomplete style). The brief's fallback specification therefore applies:
 *
 *   "DataPulse wordmark fades in. A circular progress indicator rotates below
 *    it. Data columns count up rapidly in the background suggesting data being
 *    processed. Page fades in when loading completes. Under 2 seconds."
 *
 * Total budget here: 1,500ms (wordmark 420ms fade, ring from 180ms,
 * 260ms exit fade) — comfortably under the 2s ceiling.
 */

const TOTAL_MS = 1500;
const EXIT_MS = 260;
const COLUMN_COUNT = 14;

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"active" | "exiting" | "done">("active");
  const [counters, setCounters] = useState<number[]>(() => new Array(COLUMN_COUNT).fill(0));
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion: no splash animation at all, reveal immediately.
    if (reduced.current) {
      setPhase("done");
      document.body.dataset.loaded = "true";
      return;
    }

    // Background "data columns" counting up rapidly, suggesting processing.
    const tick = window.setInterval(() => {
      setCounters((prev) => prev.map(() => Math.floor(Math.random() * 9000) + 1000));
    }, 90);

    const exit = window.setTimeout(() => setPhase("exiting"), TOTAL_MS - EXIT_MS);
    const done = window.setTimeout(() => {
      setPhase("done");
      document.body.dataset.loaded = "true";
    }, TOTAL_MS);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(exit);
      window.clearTimeout(done);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={styles.screen}
      data-exiting={phase === "exiting"}
      role="status"
      aria-live="polite"
      aria-label="Loading DataPulse Analytics"
    >
      {/* Background: data columns counting up */}
      <div className={styles.columns} aria-hidden="true">
        {counters.map((value, i) => (
          <div
            key={i}
            className={styles.column}
            style={{
              // deterministic per-column height + delay, no layout thrash
              ["--col-h" as string]: `${28 + ((i * 37) % 62)}%`,
              ["--col-delay" as string]: `${i * 45}ms`,
            }}
          >
            <span className={styles.columnValue}>{value}</span>
            <span className={styles.columnBar} />
          </div>
        ))}
      </div>

      <div className={styles.center}>
        {/* Wordmark fades in */}
        <div className={styles.wordmark}>
          <span className={styles.mark} aria-hidden="true">
            <span className={styles.markBar} />
            <span className={styles.markBar} />
            <span className={styles.markBar} />
          </span>
          <span className={styles.wordmarkText}>
            Data<strong>Pulse</strong>
          </span>
        </div>

        {/* Circular progress indicator rotates below it */}
        <svg className={styles.ring} viewBox="0 0 50 50" aria-hidden="true">
          <circle className={styles.ringTrack} cx="25" cy="25" r="20" />
          <circle className={styles.ringHead} cx="25" cy="25" r="20" />
        </svg>

        <p className={styles.caption}>Preparing your analytics workspace</p>
      </div>
    </div>
  );
}
