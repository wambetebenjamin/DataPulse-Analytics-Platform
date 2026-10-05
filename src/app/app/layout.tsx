import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · DataPulse Dashboard" },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Application shell.
 *
 * Open in trial mode: anonymous visitors get the full dashboard with each
 * category usable once (TrialGate enforces the one-free-view rule client-side
 * and the pages render with Owner-level visibility for the trial). Signed-in
 * users keep the full experience with role gating enforced per page and per
 * API route — the trial never weakens those checks.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  return (
    <DashboardShell
      user={
        user
          ? {
              name: user.name,
              email: user.email,
              role: user.role,
              organisation: user.organisation,
              plan: user.plan,
            }
          : null
      }
    >
      {children}
    </DashboardShell>
  );
}
