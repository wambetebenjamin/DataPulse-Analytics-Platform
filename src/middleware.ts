import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge middleware.
 *
 * Three jobs, in order:
 *   1. Rate limit the public API at the edge, before a lambda is ever woken.
 *   2. Gate /app/** behind an authenticated session.
 *   3. Attach security headers that complement the static set in vercel.json.
 *
 * Runs on the edge runtime, so the in-memory counter below is per-region and
 * best effort; src/lib/rate-limit.ts applies the durable per-route ceiling.
 */

export const config = {
  matcher: [
    /*
     * Everything except static assets and image optimisation. Auth API routes
     * are matched too — they need the security headers — but are exempt from
     * the session gate for obvious reasons.
     */
    "/((?!_next/static|_next/image|images/|favicon.svg|apple-icon.png|manifest.webmanifest|robots.txt|sitemap.xml|og/).*)",
  ],
};

const WINDOW_MS = 60_000;
const API_LIMIT = 60;

const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.reset <= now) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    if (hits.size > 2000) {
      for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
    }
    return false;
  }

  entry.count += 1;
  return entry.count > API_LIMIT;
}

function securityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ---------- 1. edge rate limit on the public API ---------- */
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (rateLimited(`${ip}:${pathname}`)) {
      return securityHeaders(
        NextResponse.json(
          { ok: false, error: "Too many requests. Please slow down." },
          { status: 429, headers: { "Retry-After": "60" } }
        )
      );
    }
  }

  /* ---------- 2. authentication gate on /app ---------- */
  if (pathname.startsWith("/app")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET ?? "dev-only-insecure-secret-change-me",
    });

    if (!token) {
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", pathname);
      return securityHeaders(NextResponse.redirect(login));
    }

    // Dashboard responses are per-user: never let a shared cache hold them.
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    return securityHeaders(response);
  }

  /* ---------- 3. signed-in users should not see the auth pages ---------- */
  if (pathname === "/login" || pathname === "/signup") {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET ?? "dev-only-insecure-secret-change-me",
    });
    if (token) {
      return securityHeaders(NextResponse.redirect(new URL("/app/dashboard", request.url)));
    }
  }

  return securityHeaders(NextResponse.next());
}
