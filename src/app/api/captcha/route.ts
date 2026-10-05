import { NextResponse } from "next/server";
import { verifyCaptcha, SCORE_THRESHOLD, type CaptchaAction } from "@/lib/recaptcha";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { readJson, str } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS: CaptchaAction[] = [
  "register",
  "login",
  "contact",
  "newsletter",
  "custom_project",
  "report_request",
];

/**
 * Standalone token verification.
 *
 * Each form route verifies its own token inline; this endpoint exists so a
 * client can pre-check a token (for example to decide whether to render the v2
 * challenge before the user has finished typing) without submitting the form.
 * The secret never leaves the server.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = await rateLimit(`captcha:${ip}`, 20, 60);
  if (!limit.ok) return rateLimitResponse(limit);

  const body = await readJson<{ token?: string; action?: string; v2Token?: string }>(request);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const action = str(body.action, 40) as CaptchaAction;
  if (!ACTIONS.includes(action)) {
    return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  }

  const result = await verifyCaptcha(body.token, action, {
    remoteip: ip,
    v2Token: body.v2Token,
  });

  // Score is intentionally not returned to the client — it would help an
  // attacker tune their automation. Only the decision is exposed.
  return NextResponse.json(
    {
      ok: result.ok,
      requiresV2: result.requiresV2,
      threshold: SCORE_THRESHOLD,
    },
    { status: result.ok ? 200 : result.requiresV2 ? 428 : 400 }
  );
}

export function GET() {
  return NextResponse.json(
    { ok: false, error: "Use POST." },
    { status: 405, headers: { Allow: "POST" } }
  );
}
