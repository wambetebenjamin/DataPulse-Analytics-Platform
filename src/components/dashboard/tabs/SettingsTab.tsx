"use client";

import { useState } from "react";
import {
  Check,
  Database,
  FileSpreadsheet,
  Lock,
  MessageCircle,
  ShoppingCart,
  Store,
} from "lucide-react";
import Explainer from "../Explainer";
import { ROLE_CAPABILITIES, team, type Role } from "@/data/analytics";
import { INDUSTRIES } from "@/data/site";
import styles from "../dashboard.module.css";

const INTEGRATIONS = [
  {
    id: "mpesa",
    name: "M-Pesa Daraja",
    icon: Database,
    detail: "Till 8974321 · C2B confirmation webhook active",
    connected: true,
    endpoint: "/api/integrations/mpesa",
  },
  {
    id: "sheets",
    name: "Google Sheets",
    icon: FileSpreadsheet,
    detail: "2 sheets syncing every 30 minutes",
    connected: true,
    endpoint: "/api/integrations/sheets",
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    icon: ShoppingCart,
    detail: "Orders, products and customers",
    connected: false,
    endpoint: "/api/integrations/woocommerce",
  },
  {
    id: "shopify",
    name: "Shopify",
    icon: Store,
    detail: "Orders, products and customers",
    connected: false,
    endpoint: "/api/integrations/shopify",
  },
];

const NOTIFICATIONS = [
  { id: "daily", label: "Daily revenue summary", detail: "Every morning at 07:00 EAT", on: true },
  { id: "critical", label: "Critical alerts", detail: "Immediately, any time of day", on: true },
  { id: "weekly", label: "Weekly performance digest", detail: "Mondays at 06:30 EAT", on: true },
  { id: "stock", label: "Low stock warnings", detail: "When cover falls under lead time", on: true },
  { id: "product", label: "Product news from DataPulse", detail: "At most once a month", on: false },
];

export default function SettingsTab({ role }: { role: Role }) {
  const isOwner = role === "Owner";
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: "Sokoni Retail Group",
    industry: "Retail and E-Commerce",
    county: "Nairobi",
    phone: "+254 112 272 061",
    whatsapp: "+254 112 272 061",
    currency: "KES",
    timezone: "Africa/Nairobi",
  });

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 4000);
  }

  function toggleNotification(id: string) {
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, on: !n.on } : n)));
  }

  function toggleIntegration(id: string) {
    if (!isOwner) return;
    setIntegrations((is) =>
      is.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i))
    );
  }

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Business profile</h2>
            <p className={styles.panelSub}>
              Used on reports, invoices and the branding of scheduled PDFs
            </p>
          </div>
        </div>

        <form className={styles.settingsGrid} onSubmit={saveProfile}>
          <label className={styles.ruleField}>
            <span>Organisation name</span>
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              disabled={!isOwner}
            />
          </label>
          <label className={styles.ruleField}>
            <span>Industry</span>
            <select
              value={profile.industry}
              onChange={(e) => setProfile((p) => ({ ...p, industry: e.target.value }))}
              disabled={!isOwner}
            >
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          <label className={styles.ruleField}>
            <span>County</span>
            <input
              value={profile.county}
              onChange={(e) => setProfile((p) => ({ ...p, county: e.target.value }))}
              disabled={!isOwner}
            />
          </label>
          <label className={styles.ruleField}>
            <span>Business phone</span>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              disabled={!isOwner}
            />
          </label>
          <label className={styles.ruleField}>
            <span>WhatsApp number for reports</span>
            <input
              type="tel"
              value={profile.whatsapp}
              onChange={(e) => setProfile((p) => ({ ...p, whatsapp: e.target.value }))}
              disabled={!isOwner}
            />
          </label>
          <label className={styles.ruleField}>
            <span>Reporting currency</span>
            <select
              value={profile.currency}
              onChange={(e) => setProfile((p) => ({ ...p, currency: e.target.value }))}
              disabled={!isOwner}
            >
              <option>KES</option>
              <option>UGX</option>
              <option>TZS</option>
              <option>RWF</option>
              <option>USD</option>
            </select>
          </label>
          <label className={styles.ruleField}>
            <span>Timezone</span>
            <select
              value={profile.timezone}
              onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
              disabled={!isOwner}
            >
              <option>Africa/Nairobi</option>
              <option>Africa/Kampala</option>
              <option>Africa/Dar_es_Salaam</option>
              <option>Africa/Kigali</option>
              <option>Africa/Addis_Ababa</option>
            </select>
          </label>

          <div className={styles.settingsActions}>
            <button
              type="submit"
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              disabled={!isOwner}
              title={isOwner ? undefined : "Only the workspace Owner can change the profile"}
            >
              <Check size={13} aria-hidden="true" />
              Save profile
            </button>
            {saved ? <span className={styles.savedTag}>Saved</span> : null}
          </div>
        </form>

        {!isOwner ? (
          <p className={styles.noteMuted}>
            <Lock size={12} aria-hidden="true" /> Your {role} role can view the business profile
            but not edit it.
          </p>
        ) : null}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Team and roles</h2>
            <p className={styles.panelSub}>
              {team.filter((t) => t.status === "Active").length} active ·{" "}
              {team.filter((t) => t.status === "Invited").length} invited
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Last active</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr key={member.id}>
                  <td className={styles.tdStrong}>{member.name}</td>
                  <td>{member.email}</td>
                  <td>
                    <span className={`${styles.pill} ${styles.pillInfo}`}>{member.role}</span>
                  </td>
                  <td>
                    <span
                      className={`${styles.pill} ${
                        member.status === "Active" ? styles.pillSuccess : styles.pillWarning
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td>{member.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.roleGrid}>
          {(Object.keys(ROLE_CAPABILITIES) as Role[]).map((r) => (
            <div className={styles.roleCard} key={r} data-current={r === role}>
              <p className={styles.roleName}>
                {r}
                {r === role ? <span className={styles.roleYou}>You</span> : null}
              </p>
              <ul className={styles.roleList}>
                {ROLE_CAPABILITIES[r].map((cap) => (
                  <li key={cap}>{cap}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {!isOwner ? (
          <p className={styles.noteMuted}>
            <Lock size={12} aria-hidden="true" /> Inviting people and changing roles is restricted
            to the workspace Owner.
          </p>
        ) : null}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Integrations</h2>
            <p className={styles.panelSub}>Data sources feeding your dashboards</p>
          </div>
        </div>

        <div className={styles.integrationGrid}>
          {integrations.map((item) => {
            const Icon = item.icon;
            return (
              <div className={styles.integrationCard} key={item.id}>
                <span className={styles.integrationIcon} aria-hidden="true">
                  <Icon size={17} />
                </span>
                <div className={styles.integrationBody}>
                  <p className={styles.integrationName}>{item.name}</p>
                  <p className={styles.integrationDetail}>{item.detail}</p>
                  <p className={styles.integrationEndpoint}>{item.endpoint}</p>
                </div>
                <button
                  type="button"
                  className={`${styles.pill} ${
                    item.connected ? styles.pillSuccess : styles.pillSecondary
                  }`}
                  onClick={() => toggleIntegration(item.id)}
                  disabled={!isOwner}
                  aria-pressed={item.connected}
                >
                  {item.connected ? "Connected" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>

        <Explainer title="Where are integration credentials stored?">
          <p>
            Consumer keys, secrets and OAuth refresh tokens are held as encrypted server-side
            environment values and are never sent to the browser. The dashboard only ever receives
            the data that comes back from a sync, never the credential that fetched it. Revoking a
            connection here deletes the stored token immediately.
          </p>
        </Explainer>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Notifications</h2>
            <p className={styles.panelSub}>What reaches you, and when</p>
          </div>
        </div>

        <ul className={styles.toggleList}>
          {notifications.map((n) => (
            <li className={styles.toggleRow} key={n.id}>
              <div>
                <p className={styles.toggleLabel}>{n.label}</p>
                <p className={styles.toggleDetail}>{n.detail}</p>
              </div>
              <label className={styles.switch}>
                <span className="dp-sr-only">{n.label}</span>
                <input
                  type="checkbox"
                  checked={n.on}
                  onChange={() => toggleNotification(n.id)}
                />
                <span className={styles.switchTrack} aria-hidden="true">
                  <span className={styles.switchThumb} />
                </span>
              </label>
            </li>
          ))}
        </ul>

        <p className={styles.noteMuted}>
          Notification preferences are per person, not per workspace — changing yours does not
          affect your colleagues.
        </p>
      </section>
    </>
  );
}
