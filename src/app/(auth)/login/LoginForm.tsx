"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { SoftInput } from "@/components/soft";
import { useRecaptcha, useRecaptchaV2Fallback } from "@/components/forms/useRecaptcha";
import { team } from "@/data/analytics";
import styles from "../auth.module.css";

/**
 * Sign-in.
 *
 * Brief: reCAPTCHA on "suspicious login". A token is minted on every attempt
 * but only *verified* once an attempt has already failed — that is the
 * suspicion signal — which keeps the happy path fast and the brute-force path
 * expensive.
 */
export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/app/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [state, setState] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  const suspicious = attempts >= 1;
  const { execute } = useRecaptcha("login");
  const v2 = useRecaptchaV2Fallback(attempts >= 3);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");

    // After a failed attempt, prove humanity before we try the credentials again.
    if (suspicious) {
      const token = await execute();
      const res = await fetch("/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "login", v2Token: v2.token }),
      });
      if (!res.ok) {
        setState("idle");
        setAttempts((a) => a + 1);
        setError(
          res.status === 428
            ? "Please complete the challenge below and try again."
            : "Security verification failed. Refresh the page and try again."
        );
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setAttempts((a) => a + 1);
      setState("idle");
      setError("That email and password combination was not recognised.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  function useDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("datapulse2026");
    setError("");
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {error ? (
        <p className={`${styles.alert} ${styles.alertError}`} role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="login-email">
          Work email
        </label>
        <SoftInput
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.co.ke"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="login-password">
          Password
        </label>
        <div className={styles.passwordWrap}>
          <SoftInput
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
      </div>

      <div className={styles.inlineRow}>
        <label className={styles.checkLine}>
          <input type="checkbox" name="remember" defaultChecked />
          Keep me signed in
        </label>
        <Link href="/contact?intent=password" className={styles.link}>
          Forgot password?
        </Link>
      </div>

      {attempts >= 3 && v2.available ? (
        <div className={styles.v2Wrap}>
          <p className={styles.v2Label}>
            Several attempts have failed. Please confirm you are human.
          </p>
          <div ref={v2.containerRef} />
        </div>
      ) : null}

      <button type="submit" className={styles.submit} disabled={state === "loading"}>
        {state === "loading" ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <ArrowRight size={16} aria-hidden="true" />
          </>
        )}
      </button>

      <p className={styles.captchaNote}>
        Protected by reCAPTCHA. Google&rsquo;s{" "}
        <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="https://policies.google.com/terms" rel="noopener noreferrer" target="_blank">
          Terms
        </a>{" "}
        apply.
      </p>

      <div className={styles.demoBox}>
        <strong>Demo accounts.</strong> Every role shares the password{" "}
        <code>datapulse2026</code>. Pick one to see how role-based access changes what is visible.
        <div className={styles.demoRow}>
          {team
            .filter((m) => m.status === "Active")
            .map((m) => (
              <button
                type="button"
                key={m.id}
                className={styles.demoBtn}
                onClick={() => useDemo(m.email)}
              >
                {m.role}
              </button>
            ))}
        </div>
      </div>
    </form>
  );
}
