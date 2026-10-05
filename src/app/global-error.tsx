"use client";

import { useEffect } from "react";
import styles from "./error-pages.module.css";

/**
 * Last-resort boundary: catches failures in the root layout itself, so it must
 * render its own <html> and cannot rely on anything the layout provides
 * (fonts, providers, tokens). Styling is therefore inline and self-contained.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[datapulse] root layout error", error);
  }, [error]);

  return (
    <html lang="en-KE">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          background: "#f8f9fa",
          fontFamily:
            "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
          color: "#67748e",
        }}
      >
        <div style={{ maxWidth: "46rem" }} className={styles.inner}>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#ea0606",
            }}
          >
            Error 500
          </p>
          <h1
            style={{
              margin: "16px 0 12px",
              fontSize: "2rem",
              lineHeight: 1.18,
              letterSpacing: "-0.02em",
              color: "#344767",
            }}
          >
            Dashboard temporarily unavailable.
          </h1>
          <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.7, maxWidth: "58ch" }}>
            We are restoring services. Your data is safe. Please try again in a moment, or check
            the status page for live updates.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "28px" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "0.8rem 1.75rem",
                borderRadius: "8px",
                background: "linear-gradient(310deg, #2152ff, #21d4fd)",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}
            >
              Try again
            </button>
            <a
              href="https://status.datapulse.co.ke"
              rel="noopener noreferrer"
              target="_blank"
              style={{
                padding: "0.8rem 1.75rem",
                borderRadius: "8px",
                background: "#ffffff",
                border: "1px solid #dee2e6",
                color: "#344767",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              View system status
            </a>
          </div>

          {error.digest ? (
            <p style={{ marginTop: "18px", fontSize: "11px", color: "#adb5bd" }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
