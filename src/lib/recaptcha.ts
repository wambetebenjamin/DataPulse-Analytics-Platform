/**
 * Google reCAPTCHA v3 — server-side verification.
 *
 * The design source zip contains no CAPTCHA of any kind
 * (DESIGN-SOURCE-AUDIT.md §9), so this is built fresh to the brief:
 *
 *   - v3 token on registration, login (when suspicious), contact/enquiry,
 *     newsletter and custom project request.
 *   - Verified server-side against Google's siteverify endpoint.
 *   - Score below 0.5 falls back to an interactive v2 challenge.
 *   - The secret key lives ONLY in environment variables, never in the client.
 */

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

/** Brief: "Fallback v2 if score under 0.5". */
export const SCORE_THRESHOLD = 0.5;

export type CaptchaAction =
  | "register"
  | "login"
  | "contact"
  | "newsletter"
  | "custom_project"
  | "report_request";

export interface VerifyResult {
  ok: boolean;
  score?: number;
  action?: string;
  /** Client should render the interactive v2 widget and retry. */
  requiresV2: boolean;
  reason?: string;
}

interface GoogleResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

async function siteverify(secret: string, token: string, remoteip?: string) {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set("remoteip", remoteip);

  const res = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`siteverify responded ${res.status}`);
  return (await res.json()) as GoogleResponse;
}

/**
 * Verify a v3 token. If `v2Token` is supplied (because a previous attempt fell
 * below the threshold) it is verified against the v2 secret instead.
 */
export async function verifyCaptcha(
  token: string | undefined | null,
  action: CaptchaAction,
  opts: { remoteip?: string; v2Token?: string | null } = {}
): Promise<VerifyResult> {
  const secretV3 = process.env.RECAPTCHA_SECRET_KEY;
  const secretV2 = process.env.RECAPTCHA_V2_SECRET_KEY;

  // Unconfigured environments (local dev, preview without secrets) must not
  // hard-fail the form — they log loudly and pass through instead.
  if (!secretV3) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, requiresV2: false, reason: "captcha_not_configured" };
    }
    console.warn("[recaptcha] RECAPTCHA_SECRET_KEY is not set — skipping verification in dev.");
    return { ok: true, requiresV2: false, score: 0.9, action };
  }

  // Step 2 of the fallback: an interactive v2 challenge was completed.
  if (opts.v2Token) {
    if (!secretV2) return { ok: false, requiresV2: false, reason: "v2_not_configured" };
    try {
      const data = await siteverify(secretV2, opts.v2Token, opts.remoteip);
      return data.success
        ? { ok: true, requiresV2: false, action }
        : { ok: false, requiresV2: true, reason: data["error-codes"]?.join(",") ?? "v2_failed" };
    } catch (err) {
      console.error("[recaptcha] v2 verification error", err);
      return { ok: false, requiresV2: true, reason: "v2_network_error" };
    }
  }

  if (!token) return { ok: false, requiresV2: false, reason: "missing_token" };

  try {
    const data = await siteverify(secretV3, token, opts.remoteip);

    if (!data.success) {
      return {
        ok: false,
        requiresV2: false,
        reason: data["error-codes"]?.join(",") ?? "verification_failed",
      };
    }

    // Guard against a token minted for a different form being replayed here.
    if (data.action && data.action !== action) {
      return { ok: false, requiresV2: false, reason: "action_mismatch", action: data.action };
    }

    const score = data.score ?? 0;
    if (score < SCORE_THRESHOLD) {
      return { ok: false, score, action, requiresV2: true, reason: "low_score" };
    }

    return { ok: true, score, action, requiresV2: false };
  } catch (err) {
    console.error("[recaptcha] v3 verification error", err);
    return { ok: false, requiresV2: false, reason: "network_error" };
  }
}

/** Convenience wrapper that turns a failed verification into an HTTP response. */
export function captchaFailureResponse(result: VerifyResult) {
  return Response.json(
    {
      ok: false,
      error: result.requiresV2
        ? "We could not confirm you are human. Please complete the challenge below."
        : "Security verification failed. Please refresh the page and try again.",
      requiresV2: result.requiresV2,
      reason: result.reason,
    },
    { status: result.requiresV2 ? 428 : 400 }
  );
}
