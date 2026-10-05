"use client";

import { salesPeakCalendar, KES } from "@/data/analytics";
import styles from "./dashboard.module.css";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Sales-peak calendar heatmap.
 *
 * Deliberately a CSS grid rather than a charting component: 35 cells need no
 * SVG, stay crisp at any zoom, and remain keyboard and screen-reader legible.
 */
export default function CalendarHeatmap() {
  const { cells } = salesPeakCalendar();
  const leadingBlanks = cells[0]?.dow ?? 0;

  return (
    <div>
      <div className={styles.heatGrid} role="table" aria-label="Revenue intensity by day">
        {DOW.map((d) => (
          <span className={styles.heatHead} key={d} role="columnheader">
            {d}
          </span>
        ))}

        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <span key={`blank-${i}`} className={styles.heatBlank} aria-hidden="true" />
        ))}

        {cells.map((cell) => (
          <span
            key={cell.date}
            className={styles.heatCell}
            role="cell"
            title={`${cell.date}: ${KES(cell.kes)}`}
            style={{
              background: `rgba(23, 193, 232, ${0.12 + cell.intensity * 0.78})`,
              color: cell.intensity > 0.6 ? "#ffffff" : "var(--dp-dark)",
            }}
          >
            {cell.day}
            <span className="dp-sr-only">
              {" "}
              — {KES(cell.kes)} on {cell.date}
            </span>
          </span>
        ))}
      </div>

      <div className={styles.heatLegend}>
        <span>Quieter</span>
        {[0.12, 0.3, 0.5, 0.7, 0.9].map((o) => (
          <span
            key={o}
            className={styles.heatSwatch}
            style={{ background: `rgba(23, 193, 232, ${o})` }}
            aria-hidden="true"
          />
        ))}
        <span>Busier</span>
      </div>
    </div>
  );
}
