"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { SoftInput, SoftSelect } from "@/components/soft";
import { useRecaptcha, useRecaptchaV2Fallback } from "@/components/forms/useRecaptcha";
import { INDUSTRIES, PLANS } from "@/data/site";
import styles from "../auth.module.css";

/** Crude but honest strength signal — length, variety, and no single repeat. */
function scorePassword(value: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (!value) return { score: 0, label: "Use at least 10 characters" };
  let points = 0;
  if (value.length >= 10) points += 1;
  if (value.length >= 14) points += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) points += 1;
  if (/\d/.test(value)) points += 1;
  if (/[^A-Za-z0-9]/.test(value)) points += 1;
  if (/^(.)\1+$/.test(value)) points = 0;

  if (points <= 2) return { score: 1, label: "Weak — add length or variety" };
  if (points <= 3) return { score: 2, label: "Fair — one more character class would help" };
  return { score: 3, label: "Strong" };
}

const TONE = ["", "weak", "fair", "strong"] as const;

export default function SignupForm() {
  const params = useSearchParams();
  const planParam = params.get("plan");
  const billing = params.get("billing") === "annual" ? "annual" : "monthly";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const [needsV2, setNeedsV2] = useState(false);

  const { execute } = useRecaptcha("register");
  const v2 = useRecaptchaV2Fallback(needsV2);

  const strength = useMemo(() => scorePassword(form.password), [form.password]);
  const plan = PLANS.find((p) => p.id === planParam);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!accepted) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }
    if (strength.score < 2) {
      setError("Please choose a stronger password — at least 10 characters with some variety.");
      return;
    }

    setState("loading");
    const captchaToken = await execute();

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          plan: planParam ?? "business",
          billing,
          captchaToken,
          captchaV2Token: v2.token,
        }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setState("done");
        setNeedsV2(false);
        return;
      }

      setState("idle");
      setNeedsV2(Boolean(data.requiresV2));
      if (data.requiresV2) v2.reset();
      setError(data.error ?? "We could not create that account. Please try again.");
    } catch {
      setState("idle");
      setError("Network problem. Please check your connection and try again.");
    }
  }

  if (state === "done") {
    return (
      <div className={styles.form}>
        <p className={`${styles.alert} ${styles.alertOk}`} role="status">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>
            Your workspace is being prepared. We have emailed{" "}
            <strong>{form.email}</strong> with a link to set it up — check spam if it has not
            arrived in a few minutes.
          </span>
        </p>
        <p className={styles.footNote}>
          While you wait, the{" "}
          <Link href="/demo" className={styles.link}>
            live demo dashboard
          </Link>{" "}
          shows exactly what you are about to get.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {error ? (
        <p className={`${styles.alert} ${styles.alertError}`} role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="su-name">
            Your name
          </label>
          <SoftInput
            id="su-name"
            name="name"
            autoComplete="name"
            required
            placeholder="Grace Wanjiru"
            value={form.name}
            onChange={set("name")}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="su-company">
            Organisation
          </label>
          <SoftInput
            id="su-company"
            name="company"
            autoComplete="organization"
            required
            placeholder="Sokoni Retail Ltd"
            value={form.company}
            onChange={set("company")}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="su-email">
          Work email
        </label>
        <SoftInput
          id="su-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.co.ke"
          value={form.email}
          onChange={set("email")}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="su-phone">
            Phone
          </label>
          <SoftInput
            id="su-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="0712 345 678"
            value={form.phone}
            onChange={set("phone")}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="su-industry">
            Industry
          </label>
          <SoftSelect
            id="su-industry"
            name="industry"
            required
            value={form.industry}
            onChange={set("industry")}
          >
            <option value="">Select an industry</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </SoftSelect>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="su-password">
          Password
        </label>
        <div className={styles.passwordWrap}>
          <SoftInput
            id="su-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="At least 10 characters"
            value={form.password}
            onChange={set("password")}
          />
          <button
            type="button"
            className={styles.peek}
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className={styles.meter} aria-hidden="true">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={styles.meterBar}
              data-on={strength.score >= i ? TONE[strength.score] : undefined}
            />
          ))}
        </div>
        <p className={styles.meterLabel}>{strength.label}</p>
      </div>

      <label className={styles.checkLine}>
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          required
        />
        <span>
          I accept the <Link href="/legal/terms">Terms of Service</Link> and have read the{" "}
          <Link href="/legal/privacy-policy">Privacy Policy</Link>, including how business data I
          upload is handled under the Kenya Data Protection Act 2019.
        </span>
      </label>

      {needsV2 && v2.available ? (
        <div className={styles.v2Wrap}>
          <p className={styles.v2Label}>One more step — please confirm you are human.</p>
          <div ref={v2.containerRef} />
        </div>
      ) : null}

      <button type="submit" className={styles.submit} disabled={state === "loading"}>
        {state === "loading" ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Creating your workspace…
          </>
        ) : (
          <>
            {plan ? `Start ${plan.name} free trial` : "Start free trial"}
            <ArrowRight size={16} aria-hidden="true" />
          </>
        )}
      </button>

      <p className={styles.captchaNote}>
        14 days free, no card required. Protected by reCAPTCHA — Google&rsquo;s{" "}
        <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="https://policies.google.com/terms" rel="noopener noreferrer" target="_blank">
          Terms
        </a>{" "}
        apply.
      </p>
    </form>
  );
}
