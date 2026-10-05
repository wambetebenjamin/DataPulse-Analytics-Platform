import styles from "./logo.module.css";

/**
 * DataPulse wordmark.
 * Three ascending bars (bar-chart motif — brief: no stars, diamonds or
 * sparkle glyphs) in the source's info gradient #2152ff -> #21d4fd.
 */
export default function Logo({
  light = false,
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  return (
    <span className={styles.logo} data-light={light}>
      <svg
        className={styles.mark}
        viewBox="0 0 32 32"
        width="32"
        height="32"
        role="img"
        aria-label="DataPulse Analytics"
      >
        <defs>
          <linearGradient id="dp-logo-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#2152ff" />
            <stop offset="100%" stopColor="#21d4fd" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#dp-logo-grad)" />
        <rect x="8" y="18" width="4" height="7" rx="1.4" fill="#ffffff" opacity="0.72" />
        <rect x="14" y="13" width="4" height="12" rx="1.4" fill="#ffffff" opacity="0.88" />
        <rect x="20" y="7" width="4" height="18" rx="1.4" fill="#ffffff" />
      </svg>
      {!compact && (
        <span className={styles.text}>
          Data<strong>Pulse</strong>
        </span>
      )}
    </span>
  );
}
