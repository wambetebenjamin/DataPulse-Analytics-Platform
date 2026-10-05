"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Loads the reCAPTCHA v3 script once and mints action-scoped tokens.
 * Only the SITE key is ever exposed here; the secret stays server-side.
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
      render: (
        container: HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void; theme?: string }
      ) => number;
      reset: (id?: number) => void;
    };
  }
}

const SCRIPT_ID = "recaptcha-v3";

export function useRecaptcha(action: string) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const [ready, setReady] = useState(false);
  const loading = useRef(false);

  useEffect(() => {
    if (!siteKey || loading.current) return;
    if (document.getElementById(SCRIPT_ID)) {
      setReady(true);
      return;
    }
    loading.current = true;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    script.onerror = () => {
      console.warn("[recaptcha] script failed to load — submitting without a token.");
      setReady(false);
    };
    document.head.appendChild(script);
  }, [siteKey]);

  /** Returns a fresh token, or null when reCAPTCHA is unavailable. */
  const execute = useCallback(async (): Promise<string | null> => {
    if (!siteKey || !ready || !window.grecaptcha) return null;
    try {
      await new Promise<void>((resolve) => window.grecaptcha!.ready(resolve));
      return await window.grecaptcha.execute(siteKey, { action });
    } catch (err) {
      console.warn("[recaptcha] execute failed", err);
      return null;
    }
  }, [siteKey, ready, action]);

  return { execute, ready, enabled: Boolean(siteKey) };
}

/**
 * Renders the interactive v2 checkbox used as the fallback when a v3 score
 * comes back under 0.5.
 */
export function useRecaptchaV2Fallback(enabled: boolean) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY;

  useEffect(() => {
    if (!enabled || !siteKey || !containerRef.current || widgetId.current !== null) return;

    const id = "recaptcha-v2-explicit";
    const render = () => {
      if (!containerRef.current || !window.grecaptcha?.render) return;
      widgetId.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (t: string) => setToken(t),
      });
    };

    if (document.getElementById(id)) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => window.grecaptcha?.ready(render);
    document.head.appendChild(script);
  }, [enabled, siteKey]);

  const reset = useCallback(() => {
    setToken(null);
    if (widgetId.current !== null) window.grecaptcha?.reset(widgetId.current);
  }, []);

  return { containerRef, token, reset, available: Boolean(siteKey) };
}
