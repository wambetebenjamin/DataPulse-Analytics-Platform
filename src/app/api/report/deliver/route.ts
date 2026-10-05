import { requireUser } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { isEmail, normalisePhone, readJson, sanitise, str } from "@/lib/validation";
import { enquiryTemplate, sendMail } from "@/lib/mail";
import { sendWhatsAppText } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deliver a generated report by email and/or WhatsApp.
 * Owner, Manager and Analyst may send; Viewer may not.
 */
export async function POST(request: Request) {
  const auth = await requireUser({ tab: "reports" });
  if ("response" in auth) return auth.response;
  if (auth.user.role === "Viewer") {
    return jsonNoStore(
      { ok: false, error: "Your Viewer role cannot send reports." },
      { status: 403 }
    );
  }

  const limit = await rateLimit(`report-deliver:${auth.user.email}`, 10, 3600);
  if (!limit.ok) return rateLimitResponse(limit);

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return jsonNoStore({ ok: false, error: "Invalid request." }, { status: 400 });

  const title = sanitise(str(body.title, 160)) || "DataPulse report";
  const summaryLines = Array.isArray(body.summary)
    ? (body.summary as unknown[]).map((l) => sanitise(str(l, 200))).slice(0, 40)
    : [];
  const emails = Array.isArray(body.emails)
    ? (body.emails as unknown[]).map((e) => str(e, 254).toLowerCase()).filter(isEmail).slice(0, 20)
    : [];
  const phones = Array.isArray(body.phones)
    ? (body.phones as unknown[]).map(normalisePhone).filter(Boolean).slice(0, 20)
    : [];

  if (emails.length === 0 && phones.length === 0) {
    return jsonNoStore(
      { ok: false, error: "Add at least one email address or phone number." },
      { status: 422 }
    );
  }

  const template = enquiryTemplate(
    title,
    summaryLines.map((line) => {
      const [label, ...rest] = line.split(":");
      return [label?.trim() ?? "Item", rest.join(":").trim() || "—"] as [string, string];
    })
  );

  const emailResults = await Promise.all(
    emails.map((to) =>
      sendMail({
        to,
        subject: `${title} — ${auth.user.organisation}`,
        ...template,
      })
    )
  );

  const whatsappBody = [
    `*${title}*`,
    auth.user.organisation,
    "",
    ...summaryLines,
    "",
    "Sent by DataPulse Analytics. Figures marked as estimates carry a confidence interval.",
  ].join("\n");

  const waResults = await Promise.all(phones.map((to) => sendWhatsAppText(to, whatsappBody)));

  const delivered = emailResults.filter(Boolean).length + waResults.filter(Boolean).length;
  const attempted = emails.length + phones.length;

  return jsonNoStore({
    ok: delivered > 0,
    delivered,
    attempted,
    failed: attempted - delivered,
    channels: {
      email: emails.length ? `${emailResults.filter(Boolean).length}/${emails.length}` : "none",
      whatsapp: phones.length ? `${waResults.filter(Boolean).length}/${phones.length}` : "none",
    },
    sentAt: new Date().toISOString(),
    ip: clientIp(request),
  });
}
