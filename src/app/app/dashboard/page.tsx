import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser, canAccessTab } from "@/lib/auth";
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";
import TrialGate from "@/components/dashboard/TrialGate";

export const metadata: Metadata = { title: "Overview" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardOverviewPage() {
  const user = await currentUser();

  // Anonymous: trial mode — every feature visible, one free view per browser.
  if (!user) {
    return (
      <TrialGate tabKey="overview">
        <OverviewTab role="Owner" />
      </TrialGate>
    );
  }

  if (!canAccessTab(user.role, "overview")) redirect("/app/dashboard/reports");

  return <OverviewTab role={user.role} />;
}
