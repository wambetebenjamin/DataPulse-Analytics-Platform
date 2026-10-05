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
import { BUDGET_RANGES, DATA_SOURCES, INDUSTRIES } from "@/data/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOURCE_LABELS = new Set<string>(DATA_SOURCES);
const INDUSTRY_SET = new Set<string>(INDUSTRIES);
const BUDGET_SET = new Set<string>(BUDGET_RANGES);

/** Custom analytics project enquiries — the second conversion goal in the brief. */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = await rateLimit(`custom:${ip}`, 3, 600);
  if (!limit.ok) return rateLimitResponse(limit);

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  if (isHoneypotTripped(body.website)) {
    return NextResponse.json({ ok: true, message: "Thank you — we have your brief." });
  }

  const company = sanitise(str(body.company, 160));
  const industry = sanitise(str(body.industry, 80));
  const name = sanitise(str(body.name, 120));
  const email = str(body.email, 254).toLowerCase();
  const phone = normalisePhone(body.phone);
  const description = str(body.description, 6000);
  const budget = sanitise(str(body.budget, 80));

  const dataSources = Array.isArray(body.dataSources)
    ? (body.dataSources as unknown[])
        .map((s) => sanitise(str(s, 80)))
        .filter((s) => s && (SOURCE_LABELS.size === 0 || SOURCE_LABELS.has(s)))
        .slice(0, 20)
    : [];

  const errors: FieldError[] = [];
  if (company.length < 2)
    errors.push({ field: "company", message: "Please give the organisation name." });
  if (!industry || (INDUSTRY_SET.size > 0 && !INDUSTRY_SET.has(industry)))
    errors.push({ field: "industry", message: "Please choose an industry." });
  if (name.length < 2) errors.push({ field: "name", message: "Please tell us your name." });
  if (!isEmail(email))
    errors.push({ field: "email", message: "Please enter a valid email address." });
  if (!isPhone(body.phone))
    errors.push({ field: "phone", message: "Please enter a phone number we can reach you on." });
  if (description.trim().length < 20)
    errors.push({
      field: "description",
      message: "Please describe what you need in a sentence or two.",
    });
  if (budget && BUDGET_SET.size > 0 && !BUDGET_SET.has(budget))
    errors.push({ field: "budget", message: "Please choose a budget range." });
  if (errors.length) return errorResponse(errors);

  const captcha = await verifyCaptcha(body.captchaToken as string, "custom_project", {
    remoteip: ip,
    v2Token: body.captchaV2Token as string,
  });
  if (!captcha.ok) return captchaFailureResponse(captcha);

  const notification = enquiryTemplate("New custom analytics enquiry", [
    ["Organisation", company],
    ["Industry", industry],
    ["Contact", name],
    ["Email", email],
    ["Phone", phone],
    ["Data sources", dataSources.length ? dataSources.join(", ") : "Not specified"],
    ["Budget", budget || "Not specified"],
    ["Requirement", description],
    ["IP", ip],
    ["Received", new Date().toISOString()],
  ]);

  const delivered = await sendMail({
    to: TEAM_EMAIL,
    replyTo: email,
    subject: `[Custom project] ${company} — ${industry}`,
    ...notification,
  });

  if (!delivered) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not send that just now. Please WhatsApp us on +254 112 272 061 so we do not lose your brief.",
      },
      { status: 502 }
    );
  }

  await sendMail({
    to: email,
    subject: "Your custom analytics brief — DataPulse Analytics",
    ...acknowledgementTemplate(
      name.split(" ")[0] ?? "",
      "Thanks for the detail. One of our analysts will review your brief and come back within two business days with initial questions and an indicative scope. Nothing is chargeable until a scope is agreed in writing."
    ),
  });

  return NextResponse.json({
    ok: true,
    message: "Brief received. An analyst will reply within two business days.",
  });
}
