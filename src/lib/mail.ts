import nodemailer, { type Transporter } from "nodemailer";
import { SITE } from "@/data/site";
import { escapeHtml } from "./validation";

/**
 * Transactional email.
 *
 * SMTP via Nodemailer is the primary path; if SENDGRID_API_KEY is set instead,
 * the SendGrid HTTP API is used (no SMTP egress needed, which some hosts
 * block). When neither is configured — local dev, preview deploys — messages
 * are logged rather than sent, so forms still complete end to end.
 */

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

const FROM = process.env.MAIL_FROM ?? `${SITE.name} <no-reply@datapulse.co.ke>`;
const TEAM_INBOX = process.env.MAIL_TEAM_INBOX ?? SITE.email;

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  return transporter;
}

async function sendViaSendGrid(message: MailMessage): Promise<boolean> {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) return false;

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: message.to }] }],
      from: { email: FROM.replace(/.*<|>.*/g, "") || FROM, name: SITE.name },
      reply_to: message.replyTo ? { email: message.replyTo } : undefined,
      subject: message.subject,
      content: [
        { type: "text/plain", value: message.text },
        { type: "text/html", value: message.html },
      ],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[mail] SendGrid rejected the message", res.status, await res.text());
    return false;
  }
  return true;
}

export async function sendMail(message: MailMessage): Promise<boolean> {
  try {
    if (process.env.SENDGRID_API_KEY) return await sendViaSendGrid(message);

    const tx = getTransporter();
    if (!tx) {
      console.info(
        `[mail] No transport configured — would have sent "${message.subject}" to ${message.to}`
      );
      return true;
    }

    await tx.sendMail({
      from: FROM,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return true;
  } catch (err) {
    console.error("[mail] send failed", err);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f8f9fa;font-family:Roboto,Helvetica,Arial,sans-serif;color:#67748e;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 27px 0 rgba(0,0,0,.05);">
      <tr>
        <td style="background:linear-gradient(310deg,#2152ff,#21d4fd);padding:24px 28px;">
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">${escapeHtml(SITE.name)}</p>
          <p style="margin:4px 0 0;color:rgba(255,255,255,.82);font-size:13px;">${escapeHtml(title)}</p>
        </td>
      </tr>
      <tr><td style="padding:28px;font-size:15px;line-height:1.7;">${bodyHtml}</td></tr>
      <tr>
        <td style="padding:18px 28px;background:#f8f9fa;font-size:11px;color:#adb5bd;">
          ${escapeHtml(SITE.legalName)} · ${escapeHtml(SITE.address)} · ${escapeHtml(SITE.phoneDisplay)}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Internal notification of a new enquiry, with the fields laid out as a table. */
export function enquiryTemplate(
  heading: string,
  fields: [string, string][]
): { html: string; text: string } {
  const rows = fields
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;color:#adb5bd;font-size:12px;text-transform:uppercase;letter-spacing:.05em;width:34%;vertical-align:top;">${escapeHtml(
          label
        )}</td><td style="padding:8px 0;color:#344767;font-size:14px;">${escapeHtml(
          value
        ).replace(/\n/g, "<br>")}</td></tr>`
    )
    .join("");

  return {
    html: layout(
      heading,
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`
    ),
    text: `${heading}\n\n${fields.map(([l, v]) => `${l}: ${v}`).join("\n")}`,
  };
}

/** Acknowledgement sent back to the person who filled in the form. */
export function acknowledgementTemplate(
  name: string,
  body: string
): { html: string; text: string } {
  const greeting = name ? `Hello ${escapeHtml(name)},` : "Hello,";
  return {
    html: layout(
      "We have your message",
      `<p style="margin:0 0 14px;">${greeting}</p>
       <p style="margin:0 0 14px;">${escapeHtml(body)}</p>
       <p style="margin:0 0 14px;">If it is urgent, WhatsApp us on ${escapeHtml(
         SITE.phoneDisplay
       )} and we will pick it up faster.</p>
       <p style="margin:24px 0 0;color:#adb5bd;font-size:13px;">— The ${escapeHtml(
         SITE.name
       )} team, Nairobi</p>`
    ),
    text: `${name ? `Hello ${name},` : "Hello,"}\n\n${body}\n\nIf it is urgent, WhatsApp us on ${
      SITE.phoneDisplay
    }.\n\n— The ${SITE.name} team, Nairobi`,
  };
}

export const TEAM_EMAIL = TEAM_INBOX;
