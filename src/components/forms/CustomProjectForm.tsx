"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { SoftInput, SoftSelect, SoftTextarea } from "@/components/soft";
import { BUDGET_RANGES, DATA_SOURCES, INDUSTRIES } from "@/data/site";
import { useRecaptcha, useRecaptchaV2Fallback } from "./useRecaptcha";
import styles from "./form.module.css";

/**
 * Custom analytics project enquiry.
 * Posts to /api/custom which sends a WhatsApp notification to the DataPulse
 * team and an email confirmation to the enquirer.
 */
export default function CustomProjectForm() {
  const [sources, setSources] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [needsV2, setNeedsV2] = useState(false);
  const { execute } = useRecaptcha("custom_project");
  const v2 = useRecaptchaV2Fallback(needsV2);

  const toggleSource = (s: string) =>
    setSources((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return;
    const form = e.currentTarget;
    const fd = new FormData(form);

    setState("loading");
    setMessage("");

    try {
      const captchaToken = await execute();
      const res = await fetch("/api/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: fd.get("company"),
          industry: fd.get("industry"),
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          dataSources: sources,
          description: fd.get("description"),
          budget: fd.get("budget"),
          website: fd.get("website"), // honeypot
          captchaToken,
          captchaV2Token: v2.token,
        }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setState("ok");
        setNeedsV2(false);
        setMessage(
          data.message ??
            "Enquiry received. We will be in touch on WhatsApp and email within one business day."
        );
        form.reset();
        setSources([]);
      } else {
        setState("error");
        setNeedsV2(Boolean(data.requiresV2));
        if (data.requiresV2) v2.reset();
        setMessage(data.error ?? "We could not submit your enquiry. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="p-company">
            Company name
          </label>
          <SoftInput id="p-company" name="company" required placeholder="Acacia Retail Group" />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="p-industry">
            Industry
          </label>
          <SoftSelect id="p-industry" name="industry" required defaultValue="">
            <option value="" disabled>
              Select your industry
            </option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </SoftSelect>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="p-name">
            Your name
          </label>
          <SoftInput id="p-name" name="name" required autoComplete="name" placeholder="Brian Otieno" />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="p-email">
            Email
          </label>
          <SoftInput
            id="p-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="brian@acaciaretail.co.ke"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="p-phone">
            Phone <span className={styles.optional}>(WhatsApp)</span>
          </label>
          <SoftInput
            id="p-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="+254 7XX XXX XXX"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="p-budget">
            Budget range
          </label>
          <SoftSelect id="p-budget" name="budget" required defaultValue="">
            <option value="" disabled>
              Select a range
            </option>
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </SoftSelect>
        </div>

        <fieldset className={`${styles.field} ${styles.full}`}>
          <legend className={styles.label}>Data sources available</legend>
          <div className={styles.checkGroup}>
            {DATA_SOURCES.map((src) => (
              <label
                key={src}
                className={styles.check}
                data-checked={sources.includes(src)}
              >
                <input
                  type="checkbox"
                  name="dataSources"
                  value={src}
                  checked={sources.includes(src)}
                  onChange={() => toggleSource(src)}
                />
                {src}
              </label>
            ))}
          </div>
          <span className={styles.hint}>
            Tick everything that applies. We can work with messy spreadsheets — that is usually
            where we start.
          </span>
        </fieldset>

        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="p-description">
            What do you need?
          </label>
          <SoftTextarea
            id="p-description"
            name="description"
            required
            rows={7}
            placeholder="Describe the decisions you are trying to make, the reports you build by hand today, and what a finished dashboard would need to show you every morning."
          />
        </div>
      </div>

      <div className={styles.hp} aria-hidden="true">
        <label htmlFor="p-website">Leave this field empty</label>
        <input id="p-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {needsV2 && v2.available && (
        <div className={styles.v2Wrap}>
          <span className={styles.v2Label}>One more step — please confirm you are human.</span>
          <div ref={v2.containerRef} />
        </div>
      )}

      {message && (
        <div
          role="status"
          className={`${styles.status} ${
            state === "ok" ? styles.statusSuccess : styles.statusError
          }`}
        >
          {state === "ok" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
          <span>{message}</span>
        </div>
      )}

      <div className={styles.submitRow}>
        <button type="submit" className={styles.submit} disabled={state === "loading"}>
          {state === "loading" ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Submitting
            </>
          ) : (
            <>
              <Send size={15} aria-hidden="true" />
              Submit Project Enquiry
            </>
          )}
        </button>
        <p className={styles.captchaNote}>
          Protected by reCAPTCHA. Google&apos;s{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
            Terms
          </a>{" "}
          apply.
        </p>
      </div>
    </form>
  );
}
