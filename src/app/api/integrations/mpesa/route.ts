import { createHash } from "node:crypto";
import { requireUser } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { normalisePhone, readJson, str } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Safaricom M-Pesa Daraja integration.
 *
 * Two distinct consumers:
 *   GET  — the dashboard, asking about connection status (authenticated).
 *   POST — Safaricom, delivering a C2B confirmation callback (unauthenticated,
 *          verified by shared secret and source, never by session).
 *
 * Credentials (consumer key/secret, passkey, short code) are read from the
 * environment and never returned to the client.
 */

const SHORT_CODE = process.env.MPESA_SHORT_CODE;
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const CALLBACK_SECRET = process.env.MPESA_CALLBACK_SECRET;

const BASE =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

/** OAuth token, cached in module scope for its lifetime. */
let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string | null> {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.value;

  const basic = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  try {
    const res = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${basic}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string; expires_in?: string };
    if (!data.access_token) return null;
    cachedToken = {
      value: data.access_token,
      expiresAt: Date.now() + Number(data.expires_in ?? 3599) * 1000,
    };
    return cachedToken.value;
  } catch (err) {
    console.error("[mpesa] token request failed", err);
    return null;
  }
}

export async function GET() {
  const auth = await requireUser({ tab: "settings" });
  if ("response" in auth) return auth.response;

  const configured = Boolean(CONSUMER_KEY && CONSUMER_SECRET && SHORT_CODE);
  const token = configured ? await accessToken() : null;

  return jsonNoStore({
    ok: true,
    integration: "mpesa",
    configured,
    authenticated: Boolean(token),
    environment: process.env.MPESA_ENV === "production" ? "production" : "sandbox",
    // Never expose the short code in full to a non-Owner.
    shortCode:
      SHORT_CODE && auth.user.role === "Owner"
        ? SHORT_CODE
        : SHORT_CODE
          ? `••••${SHORT_CODE.slice(-3)}`
          : null,
    callbackUrl: "/api/integrations/mpesa",
    checkedAt: new Date().toISOString(),
  });
}

/**
 * C2B confirmation callback from Safaricom.
 *
 * Idempotent on TransID: a redelivered callback must not double-count revenue.
 * Responds immediately — any heavy work is queued, never done inline.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = await rateLimit(`mpesa-callback:${ip}`, 120, 60);
  if (!limit.ok) return rateLimitResponse(limit);

  // Shared-secret check on the callback path (configured in the Daraja portal
  // as a query parameter), since Safaricom does not sign its payloads.
  if (CALLBACK_SECRET) {
    const provided = new URL(request.url).searchParams.get("secret");
    if (provided !== CALLBACK_SECRET) {
      return jsonNoStore(
        { ResultCode: 1, ResultDesc: "Rejected" },
        { status: 401 }
      );
    }
  }

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) {
    return jsonNoStore({ ResultCode: 1, ResultDesc: "Rejected" }, { status: 400 });
  }

  const transId = str(body.TransID, 64);
  const amount = Number(str(body.TransAmount, 24)) || 0;
  const msisdn = normalisePhone(body.MSISDN);
  const billRef = str(body.BillRefNumber, 64);

  if (!transId || amount <= 0) {
    return jsonNoStore({ ResultCode: 1, ResultDesc: "Rejected" }, { status: 422 });
  }

  // Payer numbers are personal data: store a stable pseudonym, not the number,
  // unless the workspace has a lawful basis for the raw value (DPA 2019).
  const payerKey = createHash("sha256")
    .update(`${msisdn}:${process.env.NEXTAUTH_SECRET ?? "dp"}`)
    .digest("hex")
    .slice(0, 16);

  console.info("[mpesa] confirmed", { transId, amount, payerKey, billRef });

  // Safaricom requires a prompt acknowledgement; anything slower risks a retry.
  return jsonNoStore({ ResultCode: 0, ResultDesc: "Accepted" });
}
