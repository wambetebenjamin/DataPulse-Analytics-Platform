"use client";

import { SessionProvider } from "next-auth/react";
import { DashboardUIProvider } from "@/components/dashboard/ui-context";

/**
 * Client providers.
 *
 * DashboardUIProvider is the direct descendant of the zip's
 * src/context/index.js — the same Context + useReducer model with the same
 * state keys (miniSidenav, sidenavColor, fixedNavbar, transparentNavbar,
 * direction, layout). See DESIGN-SOURCE-AUDIT.md §3.3.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardUIProvider>{children}</DashboardUIProvider>
    </SessionProvider>
  );
}
