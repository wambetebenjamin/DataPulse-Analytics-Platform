import { SITE } from "@/data/site";

/**
 * WhatsApp Cloud API.
 *
 * Used for scheduled report delivery and critical alerts. Credentials live in
 * environment variables only. When unconfigured (local dev, preview deploys)
 * the message is logged and the call reports success, so the surrounding flow
 * can be exercised end to end without a Meta app.
 *
 * Note: outside a 24-hour customer-service window, Meta only permits
 * pre-approved template messages. Scheduled reports therefore use a template
 * in production; free-form text is for replies inside an open window.
 */

const API_VERSION = "v21.0";

function config() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  return token && phoneId ? { token, phoneId } : null;
}

/** E.164 without the leading plus, which is what the Cloud API expects. */
function toWaId(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

async function post(payload: Record<string, unknown>): Promise<boolean> {
  const cfg = config();
  if (!cfg) {
    console.info("[whatsapp] Not configured — would have sent", JSON.stringify(payload));
    return true;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${cfg.phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.error("[whatsapp] send failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[whatsapp] network error", err);
    return false;
  }
}

export function sendWhatsAppText(to: string, body: string): Promise<boolean> {
  return post({
    to: toWaId(to),
    type: "text",
    text: { preview_url: false, body: body.slice(0, 4096) },
  });
}

/** Template message — the compliant path for scheduled, unsolicited reports. */
export function sendWhatsAppTemplate(
  to: string,
  template: string,
  parameters: string[],
  language = "en"
): Promise<boolean> {
  return post({
    to: toWaId(to),
    type: "template",
    template: {
      name: template,
      language: { code: language },
      components: [
        {
          type: "body",
          parameters: parameters.map((text) => ({ type: "text", text })),
        },
      ],
    },
  });
}

/** Click-to-chat link used throughout the marketing site. */
export function clickToChat(message = SITE.whatsappMessage): string {
  return `https://wa.me/${SITE.phone}?text=${encodeURIComponent(message)}`;
}
