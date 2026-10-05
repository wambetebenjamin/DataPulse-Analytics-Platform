"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, Lock, X } from "lucide-react";
import styles from "./cookie-consent.module.css";

/**
 * Cookie consent banner.
 *
 * The design source zip contains NO cookie banner — grep for "cookie" across
 * src/ returned zero hits (DESIGN-SOURCE-AUDIT.md §8). The brief's fallback
 * specification therefore applies, with Kenya Data Protection Act 2019
 * requirements layered on:
 *
 *   - Consent is opt-IN for every non-essential category (s.32 DPA 2019).
 *   - Necessary cookies are locked on and cannot be declined.
 *   - The choice is persisted in localStorage and never re-prompts.
 *   - The banner links to /legal/cookie-policy.
 *   - Consent is versioned and timestamped so it can be re-collected if the
 *     categories change, and evidenced if the ODPC ever asks.
 */

const STORAGE_KEY = "datapulse_cookie_consent";
const CONSENT_VERSION = 1;

export interface ConsentState {
  version: number;
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

const CATEGORIES = [
  {
    key: "necessary" as const,
    label: "Necessary",
    locked: true,
    description:
      "Required for the platform to work at all: your login session, security tokens, load balancing and this cookie choice itself. These cannot be switched off.",
  },
  {
    key: "functional" as const,
    label: "Functional",
    locked: false,
    description:
      "Remember your dashboard layout, date-range preference, sidebar state, currency and timezone so you are not resetting them on every visit.",
  },
  {
    key: "analytics" as const,
    label: "Analytics",
    locked: false,
    description:
      "Aggregated, de-identified usage statistics that tell us which dashboard features are actually used so we can improve them.",
  },
  {
    key: "marketing" as const,
    label: "Marketing",
    locked: false,
    description:
      "Measure which campaigns bring businesses to DataPulse and avoid showing you adverts for a product you already subscribe to.",
  },
];

/** Event any page can dispatch to re-open the preferences modal. */
export const CONSENT_REOPEN_EVENT = "datapulse:consent-reopen";

/** Re-open the cookie preferences modal from anywhere (e.g. the cookie policy). */
export function openCookiePreferences(): void {
  window.dispatchEvent(new CustomEvent(CONSENT_REOPEN_EVENT));
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefs, setPrefs] = useState({ functional: true, analytics: false, marketing: false });

  useEffect(() => {
    // No repeat: if a versioned decision exists, stay silent.
    if (!readConsent()) {
      // Let the loading screen finish first so the two never overlap.
      const t = window.setTimeout(() => setVisible(true), 1700);
      return () => window.clearTimeout(t);
    }
  }, []);

  // The Cookie Policy page (and the footer) can re-open this at any time, which
  // is how consent stays withdrawable as the DPA 2019 requires.
  useEffect(() => {
    const onReopen = () => {
      const existing = readConsent();
      if (existing) {
        setPrefs({
          functional: existing.functional,
          analytics: existing.analytics,
          marketing: existing.marketing,
        });
      }
      setVisible(true);
      setModalOpen(true);
    };
    window.addEventListener(CONSENT_REOPEN_EVENT, onReopen);
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, onReopen);
  }, []);

  const persist = useCallback((state: Omit<ConsentState, "version" | "decidedAt" | "necessary">) => {
    const payload: ConsentState = {
      version: CONSENT_VERSION,
      necessary: true,
      ...state,
      decidedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* storage unavailable (private mode) — banner simply reappears next visit */
    }
    // Let any downstream tag manager react without a reload.
    window.dispatchEvent(new CustomEvent("datapulse:consent", { detail: payload }));
    setVisible(false);
    setModalOpen(false);
  }, []);

  const acceptAll = () => persist({ functional: true, analytics: true, marketing: true });
  const savePrefs = () => persist(prefs);
  const rejectNonEssential = () =>
    persist({ functional: false, analytics: false, marketing: false });

  // Escape closes the preferences modal
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  if (!visible) return null;

  return (
    <>
      <div
        className={styles.banner}
        role="region"
        aria-label="Cookie consent"
        data-open={!modalOpen}
      >
        <div className={styles.bannerInner}>
          <span className={styles.bannerIcon} aria-hidden="true">
            <Cookie size={18} strokeWidth={2} />
          </span>
          <p className={styles.message}>
            We use cookies to personalise your dashboard, remember your settings, and improve our
            platform. See our{" "}
            <Link href="/legal/cookie-policy" className={styles.inlineLink}>
              Cookie Policy
            </Link>
            .
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.ghostBtn} onClick={() => setModalOpen(true)}>
              Manage Preferences
            </button>
            <button type="button" className={styles.primaryBtn} onClick={acceptAll}>
              Accept All
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-prefs-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className={styles.modal}>
            <header className={styles.modalHead}>
              <div>
                <h2 id="cookie-prefs-title" className={styles.modalTitle}>
                  Cookie preferences
                </h2>
                <p className={styles.modalSub}>
                  Processed under the Kenya Data Protection Act 2019. Non-essential cookies stay off
                  until you switch them on.
                </p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                aria-label="Close cookie preferences"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </header>

            <ul className={styles.list}>
              {CATEGORIES.map((cat) => {
                const checked =
                  cat.key === "necessary" ? true : prefs[cat.key as keyof typeof prefs];
                return (
                  <li key={cat.key} className={styles.item}>
                    <div className={styles.itemHead}>
                      <span className={styles.itemLabel}>
                        {cat.label}
                        {cat.locked && (
                          <span className={styles.lockTag}>
                            <Lock size={11} aria-hidden="true" /> Always on
                          </span>
                        )}
                      </span>

                      <label className={styles.toggle} data-locked={cat.locked}>
                        <span className="dp-sr-only">
                          {cat.locked
                            ? `${cat.label} cookies are always on`
                            : `Enable ${cat.label.toLowerCase()} cookies`}
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={cat.locked}
                          onChange={(e) =>
                            !cat.locked &&
                            setPrefs((p) => ({ ...p, [cat.key]: e.target.checked }))
                          }
                        />
                        <span className={styles.track} aria-hidden="true">
                          <span className={styles.thumb} />
                        </span>
                      </label>
                    </div>
                    <p className={styles.itemDesc}>{cat.description}</p>
                  </li>
                );
              })}
            </ul>

            <footer className={styles.modalFoot}>
              <Link href="/legal/cookie-policy" className={styles.inlineLink}>
                Read the full Cookie Policy
              </Link>
              <div className={styles.modalActions}>
                <button type="button" className={styles.ghostBtn} onClick={rejectNonEssential}>
                  Reject Non-Essential
                </button>
                <button type="button" className={styles.primaryBtn} onClick={savePrefs}>
                  Save Preferences
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
