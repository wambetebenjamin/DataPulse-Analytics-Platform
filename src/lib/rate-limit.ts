/**
 * Fixed-window rate limiting.
 *
 * Uses Vercel KV when KV_REST_API_URL / KV_REST_API_TOKEN are present, and
 * falls back to an in-process Map otherwise. The Map is per-lambda, so it is a
 * best-effort guard in serverless — the edge middleware does the broad
 * throttling and this adds a per-route ceiling on top.
 */

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Unix ms when the current window ends. */
  reset: number;
}

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

const memory = new Map<string, { count: number; reset: number }>();

/** Periodically drop expired keys so a long-lived lambda does not grow unbounded. */
function sweep(now: number) {
  if (memory.size < 512) return;
  for (const [key, entry] of memory) {
    if (entry.reset <= now) memory.delete(key);
  }
}

async function kvIncr(key: string, windowSec: number): Promise<number | null> {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSec), "NX"],
      ]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result: unknown }[];
    const count = Number((data?.[0] as { result?: unknown })?.result);
    return Number.isFinite(count) ? count : null;
  } catch {
    return null;
  }
}

/**
 * @param identifier caller key — normally `${route}:${ip}`
 * @param limit      requests allowed per window
 * @param windowSec  window length in seconds
 */
export async function rateLimit(
  identifier: string,
  limit = 5,
  windowSec = 60
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const bucket = Math.floor(now / windowMs);
  const key = `dp:rl:${identifier}:${bucket}`;
  const reset = (bucket + 1) * windowMs;

  const kvCount = await kvIncr(key, windowSec);
  if (kvCount !== null) {
    return {
      ok: kvCount <= limit,
      limit,
      remaining: Math.max(0, limit - kvCount),
      reset,
    };
  }

  sweep(now);
  const entry = memory.get(key);
  const count = (entry?.count ?? 0) + 1;
  memory.set(key, { count, reset });

  return { ok: count <= limit, limit, remaining: Math.max(0, limit - count), reset };
}

/** Best-effort client IP from the proxy headers Vercel sets. */
export function clientIp(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? headers.get("cf-connecting-ip") ?? "unknown";
}

/** 429 response carrying the standard rate-limit headers. */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  return Response.json(
    {
      ok: false,
      error: `Too many requests. Please try again in ${retryAfter} second${
        retryAfter === 1 ? "" : "s"
      }.`,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.floor(result.reset / 1000)),
      },
    }
  );
}
