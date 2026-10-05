import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser, canAccessTab } from "@/lib/auth";
import OverviewTab from "@/components/dashboard/tabs/OverviewTab";

export const metadata: Metadata = { title: "Overview" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardOverviewPage() {
  const user = await currentUser();
  if (!user) redirect("/login?callbackUrl=/app/dashboard");
  if (!canAccessTab(user.role, "overview")) redirect("/app/dashboard/reports");

  return <OverviewTab role={user.role} />;
}
