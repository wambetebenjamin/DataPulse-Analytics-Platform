"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { SoftInput } from "@/components/soft";
import { useRecaptcha } from "./useRecaptcha";
import styles from "./form.module.css";

/**
 * Newsletter signup — "Monthly data insights for East African businesses."
 * reCAPTCHA v3 token minted with action "newsletter", verified server-side
 * by /api/newsletter.
 */
export default function NewsletterForm({ variant = "footer" }: { variant?: "footer" | "section" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const { execute } = useRecaptcha("newsletter");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMessage("");

    try {
      const captchaToken = await execute();
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captchaToken }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setState("ok");
        setMessage(data.message ?? "You are subscribed. Look out for the next issue.");
        setEmail("");
      } else {
        setState("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  return (
    <div className={variant === "section" ? styles.newsletterSection : undefined}>
      <form className={styles.newsletter} onSubmit={onSubmit} noValidate>
        <label htmlFor={`nl-email-${variant}`} className="dp-sr-only">
          Email address
        </label>
        <SoftInput
          id={`nl-email-${variant}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@yourbusiness.co.ke"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={variant === "footer" ? styles.newsletterFooter : undefined}
          aria-describedby={message ? `nl-msg-${variant}` : undefined}
        />
        <button type="submit" className={styles.newsletterBtn} disabled={state === "loading"}>
          {state === "loading" ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <>
              <Send size={14} aria-hidden="true" />
              <span className="dp-sr-only">Subscribe to the newsletter</span>
            </>
          )}
        </button>
      </form>

      {message && (
        <p
          id={`nl-msg-${variant}`}
          role="status"
          className={`${styles.newsletterMsg} ${
            state === "ok" ? styles.newsletterMsgOk : styles.newsletterMsgErr
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
