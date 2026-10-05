"use client";

import { createContext, useContext, useMemo, useReducer, type Dispatch } from "react";

/**
 * Global dashboard UI state.
 *
 * Faithful TypeScript port of src/context/index.js from the design source zip
 * (DESIGN-SOURCE-AUDIT.md §3.3): React Context + useReducer, identical state
 * keys, identical initial values, identical action types and setter helpers.
 * The zip used no Redux/Zustand/React-Query, and neither does this build.
 */

export interface DashboardUIState {
  miniSidenav: boolean;
  transparentSidenav: boolean;
  sidenavColor: "primary" | "secondary" | "info" | "success" | "warning" | "error" | "dark";
  transparentNavbar: boolean;
  fixedNavbar: boolean;
  openConfigurator: boolean;
  direction: "ltr" | "rtl";
  layout: "dashboard" | "page";
  mobileNavOpen: boolean;
}

type Action =
  | { type: "MINI_SIDENAV"; value: boolean }
  | { type: "TRANSPARENT_SIDENAV"; value: boolean }
  | { type: "SIDENAV_COLOR"; value: DashboardUIState["sidenavColor"] }
  | { type: "TRANSPARENT_NAVBAR"; value: boolean }
  | { type: "FIXED_NAVBAR"; value: boolean }
  | { type: "OPEN_CONFIGURATOR"; value: boolean }
  | { type: "DIRECTION"; value: DashboardUIState["direction"] }
  | { type: "LAYOUT"; value: DashboardUIState["layout"] }
  | { type: "MOBILE_NAV"; value: boolean };

function reducer(state: DashboardUIState, action: Action): DashboardUIState {
  switch (action.type) {
    case "MINI_SIDENAV":
      return { ...state, miniSidenav: action.value };
    case "TRANSPARENT_SIDENAV":
      return { ...state, transparentSidenav: action.value };
    case "SIDENAV_COLOR":
      return { ...state, sidenavColor: action.value };
    case "TRANSPARENT_NAVBAR":
      return { ...state, transparentNavbar: action.value };
    case "FIXED_NAVBAR":
      return { ...state, fixedNavbar: action.value };
    case "OPEN_CONFIGURATOR":
      return { ...state, openConfigurator: action.value };
    case "DIRECTION":
      return { ...state, direction: action.value };
    case "LAYOUT":
      return { ...state, layout: action.value };
    case "MOBILE_NAV":
      return { ...state, mobileNavOpen: action.value };
    default:
      return state;
  }
}

/* Initial values copied verbatim from the zip's context/index.js */
const initialState: DashboardUIState = {
  miniSidenav: false,
  transparentSidenav: true,
  sidenavColor: "info",
  transparentNavbar: true,
  fixedNavbar: true,
  openConfigurator: false,
  direction: "ltr",
  layout: "dashboard",
  mobileNavOpen: false,
};

const Ctx = createContext<[DashboardUIState, Dispatch<Action>] | null>(null);
Ctx.displayName = "DataPulseUIContext";

export function DashboardUIProvider({ children }: { children: React.ReactNode }) {
  const [controller, dispatch] = useReducer(reducer, initialState);
  const value = useMemo<[DashboardUIState, Dispatch<Action>]>(
    () => [controller, dispatch],
    [controller]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboardUI() {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error("useDashboardUI should be used inside the DashboardUIProvider.");
  }
  return context;
}

/* Context module functions — same names as the source */
export const setMiniSidenav = (d: Dispatch<Action>, value: boolean) =>
  d({ type: "MINI_SIDENAV", value });
export const setTransparentSidenav = (d: Dispatch<Action>, value: boolean) =>
  d({ type: "TRANSPARENT_SIDENAV", value });
export const setSidenavColor = (d: Dispatch<Action>, value: DashboardUIState["sidenavColor"]) =>
  d({ type: "SIDENAV_COLOR", value });
export const setTransparentNavbar = (d: Dispatch<Action>, value: boolean) =>
  d({ type: "TRANSPARENT_NAVBAR", value });
export const setFixedNavbar = (d: Dispatch<Action>, value: boolean) =>
  d({ type: "FIXED_NAVBAR", value });
export const setOpenConfigurator = (d: Dispatch<Action>, value: boolean) =>
  d({ type: "OPEN_CONFIGURATOR", value });
export const setDirection = (d: Dispatch<Action>, value: DashboardUIState["direction"]) =>
  d({ type: "DIRECTION", value });
export const setLayout = (d: Dispatch<Action>, value: DashboardUIState["layout"]) =>
  d({ type: "LAYOUT", value });
export const setMobileNav = (d: Dispatch<Action>, value: boolean) =>
  d({ type: "MOBILE_NAV", value });
