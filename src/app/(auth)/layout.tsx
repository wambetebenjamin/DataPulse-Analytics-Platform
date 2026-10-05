import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Auth routes deliberately render without the marketing navbar, footer or
 * WhatsApp float — nothing competes with the single action on the page.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main id="main">{children}</main>;
}
