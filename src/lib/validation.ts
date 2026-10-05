/**
 * Minimal request validation helpers.
 *
 * Deliberately dependency-free: the payloads here are small and well known, and
 * a schema library would be more bundle and more indirection than the job
 * needs. Every public route runs its input through these before using it.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts +254…, 254…, 07…, 01… and tolerates spaces, dashes and brackets. */
export const KE_PHONE_RE = /^(?:\+?254|0)?[17]\d{8}$/;

export function str(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function isEmail(value: unknown): boolean {
  const s = str(value, 254);
  return s.length > 3 && EMAIL_RE.test(s);
}

export function normalisePhone(value: unknown): string {
  const s = str(value, 32).replace(/[\s()-]/g, "");
  if (!s) return "";
  if (s.startsWith("+")) return s;
  if (s.startsWith("254")) return `+${s}`;
  if (s.startsWith("0")) return `+254${s.slice(1)}`;
  return s;
}

export function isPhone(value: unknown): boolean {
  const s = str(value, 32).replace(/[\s()+-]/g, "");
  return KE_PHONE_RE.test(s) || /^\d{7,15}$/.test(s);
}

/**
 * Strip control characters and header-injection vectors before a value is ever
 * placed in an email subject, header or WhatsApp message.
 */
export function sanitise(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
}

/** Escape user content for inclusion in an HTML email body. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface FieldError {
  field: string;
  message: string;
}

export function errorResponse(errors: FieldError[], status = 422): Response {
  return Response.json(
    {
      ok: false,
      error: errors[0]?.message ?? "Please check the form and try again.",
      errors,
    },
    { status }
  );
}

/** Parse a JSON body, returning null rather than throwing on malformed input. */
export async function readJson<T = Record<string, unknown>>(
  request: Request
): Promise<T | null> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") return null;
    return body as T;
  } catch {
    return null;
  }
}

/**
 * Honeypot check. Every public form carries a hidden "website" field that real
 * users never see; bots fill it in. Returning true means: silently accept and
 * discard, so the bot gets no signal.
 */
export function isHoneypotTripped(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
