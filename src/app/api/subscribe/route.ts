import { NextResponse } from "next/server";
import { verifyCaptcha, captchaFailureResponse } from "@/lib/recaptcha";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import {
  errorResponse,
  isEmail,
  isHoneypotTripped,
  isPhone,
  normalisePhone,
  readJson,
  sanitise,
  str,
  type FieldError,
} from "@/lib/validation";
import { TEAM_EMAIL, acknowledgementTemplate, enquiryTemplate, sendMail } from "@/lib/mail";
import { INDUSTRIES, PLANS } from "@/data/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLAN_IDS = new Set(PLANS.map((p) => p.id));
const INDUSTRY_SET = new Set<string>(INDUSTRIES);

/**
 * Trial signup / subscription request.
 *
 * This build has no database, so the route validates, verifies the CAPTCHA,
 * notifies the team and acknowledges the applicant. The commented block marks
 * exactly where account creation and the Stripe / M-Pesa STK push belong.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = await rateLimit(`subscribe:${ip}`, 5, 600);
  if (!limit.ok) return rateLimitResponse(limit);

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  if (isHoneypotTripped(body.website)) {
    return NextResponse.json({ ok: true, message: "Workspace requested." });
  }

  const name = sanitise(str(body.name, 120));
  const email = str(body.email, 254).toLowerCase();
  const phone = normalisePhone(body.phone);
  const company = sanitise(str(body.company, 160));
  const industry = sanitise(str(body.industry, 80));
  const password = str(body.password, 200);
  const planId = str(body.plan, 40).toLowerCase();
  const billing = str(body.billing, 20) === "annual" ? "annual" : "monthly";

  const errors: FieldError[] = [];
  if (name.length < 2) errors.push({ field: "name", message: "Please tell us your name." });
  if (company.length < 2)
    errors.push({ field: "company", message: "Please give your organisation name." });
  if (!isEmail(email))
    errors.push({ field: "email", message: "Please enter a valid work email address." });
  if (!isPhone(body.phone))
    errors.push({ field: "phone", message: "Please enter a phone number we can reach you on." });
  if (!INDUSTRY_SET.has(industry))
    errors.push({ field: "industry", message: "Please choose your industry." });
  if (password.length < 10)
    errors.push({
      field: "password",
      message: "Please choose a password of at least 10 characters.",
    });
  if (errors.length) return errorResponse(errors);

  const captcha = await verifyCaptcha(body.captchaToken as string, "register", {
    remoteip: ip,
    v2Token: body.captchaV2Token as string,
  });
  if (!captcha.ok) return captchaFailureResponse(captcha);

  const plan = PLAN_IDS.has(planId) ? PLANS.find((p) => p.id === planId)! : PLANS[1]!;

  /*
   * Production wiring, in order:
   *   1. Reject if the email already has a workspace.
   *   2. Hash the password with argon2id and create the Owner user.
   *   3. Create the workspace with a 14-day trial expiry.
   *   4. Email a verification link (single-use, 24h TTL).
   *   5. On trial end, Stripe subscription or M-Pesa STK push via
   *      /api/integrations/mpesa.
   * The plaintext password is never logged, emailed or echoed back.
   */

  const notification = enquiryTemplate("New trial signup", [
    ["Organisation", company],
    ["Industry", industry],
    ["Contact", name],
    ["Email", email],
    ["Phone", phone],
    ["Plan requested", `${plan.name} (${billing})`],
    ["IP", ip],
    ["Received", new Date().toISOString()],
  ]);

  await sendMail({
    to: TEAM_EMAIL,
    replyTo: email,
    subject: `[Trial] ${company} — ${plan.name}`,
    ...notification,
  });

  await sendMail({
    to: email,
    subject: "Your DataPulse workspace is being prepared",
    ...acknowledgementTemplate(
      name.split(" ")[0] ?? "",
      `Thanks for starting a ${plan.name} trial. Your workspace is being prepared and we will email the setup link shortly. Your 14 days begin when you first sign in, not today — so there is no rush.`
    ),
  });

  return NextResponse.json({
    ok: true,
    message: "Workspace requested. Check your email for the setup link.",
    plan: plan.id,
    billing,
  });
}
