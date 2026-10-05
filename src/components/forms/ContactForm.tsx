"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { SoftInput, SoftSelect, SoftTextarea } from "@/components/soft";
import { useRecaptcha, useRecaptchaV2Fallback } from "./useRecaptcha";
import styles from "./form.module.css";

const SUBJECTS = [
  "Book a product demo",
  "General enquiry",
  "Pricing and plans",
  "Technical support",
  "Partnership or reseller",
  "Media and press",
];

/** General enquiry + demo booking form. reCAPTCHA v3, server-verified. */
export default function ContactForm({ defaultSubject }: { defaultSubject?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [needsV2, setNeedsV2] = useState(false);
  const { execute } = useRecaptcha("contact");
  const v2 = useRecaptchaV2Fallback(needsV2);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return;
    const form = e.currentTarget;
    const fd = new FormData(form);

    setState("loading");
    setMessage("");

    try {
      const captchaToken = await execute();
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          company: fd.get("company"),
          subject: fd.get("subject"),
          message: fd.get("message"),
          website: fd.get("website"), // honeypot
          captchaToken,
          captchaV2Token: v2.token,
        }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setState("ok");
        setNeedsV2(false);
        setMessage(data.message ?? "Thank you. Our team will reply within one business day.");
        form.reset();
      } else {
        setState("error");
        setNeedsV2(Boolean(data.requiresV2));
        if (data.requiresV2) v2.reset();
        setMessage(data.error ?? "We could not send your message. Please try again.");
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
          <label className={styles.label} htmlFor="c-name">
            Full name
          </label>
          <SoftInput id="c-name" name="name" required autoComplete="name" placeholder="Grace Wanjiru" />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="c-email">
            Work email
          </label>
          <SoftInput
            id="c-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="grace@yourbusiness.co.ke"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="c-phone">
            Phone <span className={styles.optional}>(WhatsApp preferred)</span>
          </label>
          <SoftInput
            id="c-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+254 7XX XXX XXX"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="c-company">
            Organisation
          </label>
          <SoftInput id="c-company" name="company" autoComplete="organization" placeholder="Your company, NGO or school" />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="c-subject">
            What can we help with?
          </label>
          <SoftSelect id="c-subject" name="subject" defaultValue={defaultSubject ?? SUBJECTS[1]}>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SoftSelect>
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="c-message">
            Your message
          </label>
          <SoftTextarea
            id="c-message"
            name="message"
            required
            rows={6}
            placeholder="Tell us about your business, what data you already collect, and what you would like to understand better."
          />
          <span className={styles.hint}>
            The more context you give us, the more useful our first reply will be.
          </span>
        </div>
      </div>

      {/* honeypot */}
      <div className={styles.hp} aria-hidden="true">
        <label htmlFor="c-website">Leave this field empty</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {needsV2 && v2.available && (
        <div className={styles.v2Wrap}>
          <span className={styles.v2Label}>
            One more step — please confirm you are human.
          </span>
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
              Sending
            </>
          ) : (
            <>
              <Send size={15} aria-hidden="true" />
              Send Message
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
