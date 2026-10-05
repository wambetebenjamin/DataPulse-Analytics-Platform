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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** General contact and demo-booking enquiries. */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = await rateLimit(`contact:${ip}`, 4, 300);
  if (!limit.ok) return rateLimitResponse(limit);

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  if (isHoneypotTripped(body.website)) {
    return NextResponse.json({ ok: true, message: "Thank you — we have your message." });
  }

  const name = sanitise(str(body.name, 120));
  const email = str(body.email, 254).toLowerCase();
  const phone = normalisePhone(body.phone);
  const company = sanitise(str(body.company, 160));
  const subject = sanitise(str(body.subject, 160)) || "Website enquiry";
  const message = str(body.message, 4000);

  const errors: FieldError[] = [];
  if (name.length < 2) errors.push({ field: "name", message: "Please tell us your name." });
  if (!isEmail(email))
    errors.push({ field: "email", message: "Please enter a valid email address." });
  if (phone && !isPhone(body.phone))
    errors.push({ field: "phone", message: "Please check the phone number." });
  if (message.trim().length < 10)
    errors.push({ field: "message", message: "Please add a little more detail." });
  if (errors.length) return errorResponse(errors);

  const captcha = await verifyCaptcha(body.captchaToken as string, "contact", {
    remoteip: ip,
    v2Token: body.captchaV2Token as string,
  });
  if (!captcha.ok) return captchaFailureResponse(captcha);

  const notification = enquiryTemplate(`Contact form — ${subject}`, [
    ["Name", name],
    ["Email", email],
    ["Phone", phone || "—"],
    ["Organisation", company || "—"],
    ["Subject", subject],
    ["Message", message],
    ["IP", ip],
    ["Received", new Date().toISOString()],
  ]);

  const delivered = await sendMail({
    to: TEAM_EMAIL,
    replyTo: email,
    subject: `[Contact] ${subject} — ${name}`,
    ...notification,
  });

  if (!delivered) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not send that just now. Please WhatsApp us on +254 112 272 061 and we will pick it up immediately.",
      },
      { status: 502 }
    );
  }

  await sendMail({
    to: email,
    subject: "We have your message — DataPulse Analytics",
    ...acknowledgementTemplate(
      name.split(" ")[0] ?? "",
      "Thanks for getting in touch. A member of the team will reply within one business day, usually sooner. We have logged your enquiry and the details you sent."
    ),
  });

  return NextResponse.json({
    ok: true,
    message: "Thank you. We will reply within one business day.",
  });
}
