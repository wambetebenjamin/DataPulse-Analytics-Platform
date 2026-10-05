import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { canAccessTab, currentUser } from "@/lib/auth";
import { DASHBOARD_TABS } from "@/data/site";
import RevenueTab from "@/components/dashboard/tabs/RevenueTab";
import SalesTab from "@/components/dashboard/tabs/SalesTab";
import CustomersTab from "@/components/dashboard/tabs/CustomersTab";
import InventoryTab from "@/components/dashboard/tabs/InventoryTab";
import StaffTab from "@/components/dashboard/tabs/StaffTab";
import ReportsTab from "@/components/dashboard/tabs/ReportsTab";
import PredictionsTab from "@/components/dashboard/tabs/PredictionsTab";
import AlertsTab from "@/components/dashboard/tabs/AlertsTab";
import SettingsTab from "@/components/dashboard/tabs/SettingsTab";
import type { Role } from "@/data/analytics";

/** Dashboard pages are SSR and must never be cached (brief). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Params {
  params: { tab: string };
}

const TABS: Record<string, (props: { role: Role }) => JSX.Element> = {
  revenue: RevenueTab,
  sales: SalesTab,
  customers: CustomersTab,
  inventory: InventoryTab,
  staff: StaffTab,
  reports: ReportsTab,
  predictions: PredictionsTab,
  alerts: AlertsTab,
  settings: SettingsTab,
};

export function generateMetadata({ params }: Params): Metadata {
  const tab = DASHBOARD_TABS.find((t) => t.key === params.tab);
  return { title: tab?.label ?? "Dashboard" };
}

export default async function DashboardTabPage({ params }: Params) {
  // "overview" lives at /app/dashboard, so it is not valid here.
  const Tab = TABS[params.tab];
  if (!Tab) notFound();

  const user = await currentUser();
  if (!user) redirect(`/login?callbackUrl=/app/dashboard/${params.tab}`);

  // Role gate: a Viewer who types /app/dashboard/staff lands back on Overview
  // rather than seeing a tab their role does not grant.
  if (!canAccessTab(user.role, params.tab)) redirect("/app/dashboard?denied=" + params.tab);

  return <Tab role={user.role} />;
}
