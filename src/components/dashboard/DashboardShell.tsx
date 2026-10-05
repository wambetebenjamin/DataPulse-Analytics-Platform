"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Activity,
  Bell,
  ChevronRight,
  HelpCircle,
  Lock,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { ICONS } from "@/components/Icon";
import { DASHBOARD_TABS, SITE, whatsappLink } from "@/data/site";
import { ROLE_TABS, alerts, type Role } from "@/data/analytics";
import { readTrialUsed } from "./TrialGate";
import styles from "./shell.module.css";

export interface ShellUser {
  name: string;
  email: string;
  role: Role;
  organisation: string;
  plan: string;
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function DashboardShell({
  user,
  children,
}: {
  user: ShellUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  /* Trial mode: which categories this browser has already spent. */
  const [trialUsed, setTrialUsed] = useState<string[]>([]);
  const syncTrial = useCallback(() => setTrialUsed(readTrialUsed()), []);

  useEffect(() => {
    syncTrial();
    window.addEventListener("datapulse:trial", syncTrial);
    return () => window.removeEventListener("datapulse:trial", syncTrial);
  }, [syncTrial, pathname]);

  // Trial visitors see everything once; signed-in users see what their role grants.
  const allowed = user ? (ROLE_TABS[user.role] ?? []) : DASHBOARD_TABS.map((t) => t.key);
  const activeKey =
    DASHBOARD_TABS.find((tab) =>
      tab.key === "overview"
        ? pathname === "/app/dashboard"
        : pathname.startsWith(`/app/dashboard/${tab.key}`)
    )?.key ?? "overview";
  const activeTab = DASHBOARD_TABS.find((t) => t.key === activeKey);
  const unread = alerts.filter((a) => a.severity !== "info").length;

  // Route change closes the mobile drawer.
  useEffect(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Click-outside and Escape close the account menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className={styles.shell}>
      {drawerOpen ? (
        <div
          className={styles.overlay}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside className={styles.sidenav} data-open={drawerOpen} aria-label="Dashboard navigation">
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            <Activity size={18} strokeWidth={2.4} />
          </span>
          <span className={styles.brandText}>
            {SITE.name.split(" ")[0]}
            <span className={styles.brandSub}>
              {user ? `${user.plan} plan` : "Free trial"}
            </span>
          </span>
        </Link>

        {!user ? (
          <p className={styles.trialNote}>
            Every category is free to try once. Sign in to unlock them all.
          </p>
        ) : null}

        <p className={styles.navLabel}>Analytics</p>
        <nav className={styles.nav}>
          {DASHBOARD_TABS.map((tab) => {
            const Icon = ICONS[tab.icon] ?? ICONS["bar-chart-2"];
            const href = tab.key === "overview" ? "/app/dashboard" : `/app/dashboard/${tab.key}`;
            const permitted = allowed.includes(tab.key);
            const spent = !user && trialUsed.includes(tab.key);

            if (!permitted) {
              return (
                <span
                  key={tab.key}
                  className={`${styles.navItem} ${styles.navItemLocked}`}
                  title={`Your ${user?.role ?? "current"} role cannot open ${tab.label}`}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <Icon size={15} strokeWidth={2} />
                  </span>
                  <span>{tab.label}</span>
                  <Lock size={12} className={styles.lockIcon} aria-hidden="true" />
                </span>
              );
            }

            return (
              <Link
                key={tab.key}
                href={href}
                className={styles.navItem}
                aria-current={activeKey === tab.key ? "page" : undefined}
                title={spent ? `${tab.label} — free view used, sign in to reopen` : undefined}
              >
                <span className={styles.navIcon} aria-hidden="true">
                  <Icon size={15} strokeWidth={2} />
                </span>
                <span>{tab.label}</span>
                {spent ? (
                  <Lock size={11} className={styles.spentIcon} aria-hidden="true" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sideFoot}>
          <p className={styles.sideFootTitle}>Need a hand?</p>
          <p className={styles.sideFootCopy}>
            Ask us anything about your numbers — we reply on WhatsApp within a business day.
          </p>
          <a
            className={styles.sideFootBtn}
            href={whatsappLink("Hello! I need help with my DataPulse dashboard.")}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle size={13} aria-hidden="true" />
            Chat with support
          </a>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.burger}
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className={styles.crumbs}>
            <p className={styles.crumbPath}>
              <Link href="/app/dashboard">Dashboard</Link>
              <ChevronRight size={11} aria-hidden="true" />
              <span>{activeTab?.label ?? "Overview"}</span>
            </p>
            <h1 className={styles.crumbTitle}>{activeTab?.label ?? "Overview"}</h1>
          </div>

          <div className={styles.topActions}>
            <Link href="/app/dashboard/alerts" className={styles.iconBtn} aria-label="Alerts">
              <Bell size={17} />
              {unread > 0 ? <span className={styles.badgeDot} aria-hidden="true" /> : null}
            </Link>
            <Link href="/contact" className={styles.iconBtn} aria-label="Help and support">
              <HelpCircle size={17} />
            </Link>

            <div className={styles.userWrap} ref={menuRef}>
              {user ? (
                <button
                  type="button"
                  className={styles.user}
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                <span className={styles.avatar} aria-hidden="true">
                  {initials(user.name)}
                </span>
                <span>
                  <span className={styles.userName}>{user.name.split(" ")[0]}</span>
                  <br />
                  <span className={styles.userRole}>{user.role}</span>
                </span>
              </button>
              ) : (
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                  className={styles.signInBtn}
                >
                  <LogIn size={14} aria-hidden="true" />
                  Sign in
                </Link>
              )}

              {user && menuOpen ? (
                <div className={styles.menu} role="menu">
                  <div className={styles.menuHead}>
                    <p className={styles.menuName}>{user.name}</p>
                    <p className={styles.menuMeta}>{user.email}</p>
                    <p className={styles.menuMeta}>
                      {user.organisation} · {user.role}
                    </p>
                  </div>
                  {allowed.includes("settings") ? (
                    <Link href="/app/dashboard/settings" className={styles.menuItem} role="menuitem">
                      <SettingsIcon size={15} aria-hidden="true" />
                      Workspace settings
                    </Link>
                  ) : null}
                  <Link href="/demo" className={styles.menuItem} role="menuitem">
                    <Activity size={15} aria-hidden="true" />
                    Public demo
                  </Link>
                  <button
                    type="button"
                    className={`${styles.menuItem} ${styles.menuDanger}`}
                    role="menuitem"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut size={15} aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
