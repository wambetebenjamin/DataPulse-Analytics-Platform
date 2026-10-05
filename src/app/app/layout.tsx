import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · DataPulse Dashboard" },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Authenticated application shell.
 *
 * Brief: "Dashboard pages SSR with no-cache" and "role checks on every API
 * route and page". The edge middleware blocks unauthenticated requests before
 * they reach here; this second check is the defence in depth that matters if
 * middleware is ever misconfigured.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login?callbackUrl=/app/dashboard");

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        organisation: user.organisation,
        plan: user.plan,
      }}
    >
      {children}
    </DashboardShell>
  );
}
