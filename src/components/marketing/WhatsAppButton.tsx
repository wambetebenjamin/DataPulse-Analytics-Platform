"use client";

import { MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "@/data/site";
import styles from "./whatsapp.module.css";

/**
 * Floating WhatsApp button — marketing pages only.
 * Hidden inside the authenticated dashboard to avoid clutter (brief), which is
 * enforced by simply not rendering it in the /app layout.
 */
export default function WhatsAppButton() {
  return (
    <a
      className={styles.fab}
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Book a demo or ask about custom analytics on WhatsApp"
    >
      <span className={styles.tooltip} aria-hidden="true">
        Book a demo or ask about custom analytics
      </span>
      <span className={styles.icon}>
        <MessageCircle size={24} strokeWidth={2} aria-hidden="true" />
      </span>
      <span className={styles.pulse} aria-hidden="true" />
    </a>
  );
}
