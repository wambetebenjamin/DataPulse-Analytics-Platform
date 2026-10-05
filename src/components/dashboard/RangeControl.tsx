"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { RANGE_LABEL, type RangeKey } from "@/data/analytics";
import styles from "./dashboard.module.css";

const OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "custom", label: "Custom" },
];

/**
 * Date filter shared by every tab: 7 / 30 / 90 days plus a custom window.
 * Choosing Custom reveals two native date inputs — no date-picker dependency,
 * and the native control is what mobile users already know.
 */
export default function RangeControl({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (next: RangeKey) => void;
}) {
  const [from, setFrom] = useState("2026-08-21");
  const [to, setTo] = useState("2026-10-05");

  return (
    <>
      <div className={styles.segmented} role="group" aria-label="Date range">
        <span className={styles.segIcon} aria-hidden="true">
          <CalendarDays size={14} />
        </span>
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={styles.segBtn}
            data-active={value === opt.key}
            aria-pressed={value === opt.key}
            onClick={() => onChange(opt.key)}
            title={RANGE_LABEL[opt.key]}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {value === "custom" ? (
        <div className={styles.dateRange}>
          <label>
            <span className="dp-sr-only">From</span>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <span aria-hidden="true">→</span>
          <label>
            <span className="dp-sr-only">To</span>
            <input
              type="date"
              value={to}
              min={from}
              max="2026-10-05"
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
      ) : null}
    </>
  );
}
