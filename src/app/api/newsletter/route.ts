import { NextResponse } from "next/server";
import { verifyCaptcha, captchaFailureResponse } from "@/lib/recaptcha";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { isEmail, isHoneypotTripped, readJson, str } from "@/lib/validation";
import { TEAM_EMAIL, acknowledgementTemplate, enquiryTemplate, sendMail } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Newsletter signup — "Monthly data insights for East African businesses."
 * reCAPTCHA v3 action "newsletter", verified server-side, v2 fallback under 0.5.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = await rateLimit(`newsletter:${ip}`, 5, 300);
  if (!limit.ok) return rateLimitResponse(limit);

  const body = await readJson<{
    email?: string;
    website?: string;
    captchaToken?: string;
    captchaV2Token?: string;
  }>(request);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  // Honeypot: accept silently so the bot learns nothing.
  if (isHoneypotTripped(body.website)) {
    return NextResponse.json({ ok: true, message: "You are subscribed." });
  }

  const email = str(body.email, 254).toLowerCase();
  if (!isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 422 }
    );
  }

  const captcha = await verifyCaptcha(body.captchaToken, "newsletter", {
    remoteip: ip,
    v2Token: body.captchaV2Token,
  });
  if (!captcha.ok) return captchaFailureResponse(captcha);

  const notification = enquiryTemplate("New newsletter subscriber", [
    ["Email", email],
    ["Source", "Website newsletter form"],
    ["Received", new Date().toISOString()],
  ]);

  await Promise.all([
    sendMail({
      to: TEAM_EMAIL,
      subject: `Newsletter signup — ${email}`,
      ...notification,
    }),
    sendMail({
      to: email,
      subject: "You are on the DataPulse list",
      ...acknowledgementTemplate(
        "",
        "Thanks for subscribing. Once a month you will get one email with new articles, product notes and the occasional template you can use the same afternoon. Unsubscribe any time from the link at the bottom of it."
      ),
    }),
  ]);

  return NextResponse.json({
    ok: true,
    message: "You are subscribed. Look out for the next issue.",
  });
}
