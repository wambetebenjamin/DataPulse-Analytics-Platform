"use client";

import { useState } from "react";
import { AlertTriangle, Bell, Check, Info, Plus, X } from "lucide-react";
import Explainer from "../Explainer";
import { useReveal } from "@/lib/hooks";
import { alertHistory, alertRules, alerts, type Role } from "@/data/analytics";
import styles from "../dashboard.module.css";

const SEVERITY_ICON = { critical: AlertTriangle, warning: Bell, info: Info } as const;

interface Rule {
  id: string;
  name: string;
  condition: string;
  channel: string;
  active: boolean;
  triggered: number;
}

export default function AlertsTab({ role }: { role: Role }) {
  const canEdit = role === "Owner" || role === "Manager";
  const [rules, setRules] = useState<Rule[]>(alertRules.map((r) => ({ ...r })));
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState({
    metric: "Daily revenue",
    operator: "falls below",
    value: "50000",
    channel: "WhatsApp + Email",
  });
  const reveal = useReveal<HTMLDivElement>();

  const visible = alerts.filter((a) => !dismissed.includes(a.id));

  function toggleRule(id: string) {
    if (!canEdit) return;
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  }

  function addRule(e: React.FormEvent) {
    e.preventDefault();
    const condition = `${draft.metric} ${draft.operator} ${
      draft.metric.toLowerCase().includes("revenue")
        ? `KES ${Number(draft.value).toLocaleString("en-KE")}`
        : draft.value
    }`;
    setRules((rs) => [
      {
        id: `RULE-${String(rs.length + 1).padStart(2, "0")}`,
        name: draft.metric,
        condition,
        channel: draft.channel,
        active: true,
        triggered: 0,
      },
      ...rs,
    ]);
    setComposerOpen(false);
  }

  return (
    <>
      <section className={styles.panel} ref={reveal.ref} data-visible={reveal.visible}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Active alerts</h2>
            <p className={styles.panelSub}>
              {visible.filter((a) => a.severity === "critical").length} critical ·{" "}
              {visible.filter((a) => a.severity === "warning").length} warnings
            </p>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className={styles.noteMuted}>
            Nothing needs your attention. Alerts will appear here the moment a rule is broken.
          </p>
        ) : (
          <ul className={styles.alertList}>
            {visible.map((alert, i) => {
              const Icon = SEVERITY_ICON[alert.severity];
              return (
                <li
                  key={alert.id}
                  className={`${styles.alertItem} dp-reveal-right`}
                  data-sev={alert.severity}
                  data-visible={reveal.visible}
                  style={{ ["--dp-reveal-delay" as string]: `${i * 80}ms` }}
                >
                  <span className={styles.alertIcon} aria-hidden="true">
                    <Icon size={15} />
                  </span>
                  <div>
                    <p className={styles.alertTitle}>{alert.title}</p>
                    <p className={styles.alertDetail}>{alert.detail}</p>
                    <p className={styles.alertMeta}>
                      <span>{alert.time}</span>
                      <span>via {alert.channel}</span>
                      <span className={`${styles.pill} ${styles.pillSecondary}`}>
                        {alert.severity}
                      </span>
                    </p>
                  </div>
                  {canEdit ? (
                    <button
                      type="button"
                      className={styles.alertDismiss}
                      onClick={() => setDismissed((d) => [...d, alert.id])}
                      aria-label={`Dismiss alert: ${alert.title}`}
                    >
                      <X size={15} />
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Alert rules</h2>
            <p className={styles.panelSub}>
              Conditions you have set. {rules.filter((r) => r.active).length} active.
            </p>
          </div>
          {canEdit ? (
            <div className={styles.panelActions}>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                onClick={() => setComposerOpen((o) => !o)}
                aria-expanded={composerOpen}
              >
                <Plus size={13} aria-hidden="true" />
                New rule
              </button>
            </div>
          ) : null}
        </div>

        {composerOpen && canEdit ? (
          <form className={styles.ruleForm} onSubmit={addRule}>
            <label className={styles.ruleField}>
              <span>When</span>
              <select
                value={draft.metric}
                onChange={(e) => setDraft((d) => ({ ...d, metric: e.target.value }))}
              >
                <option>Daily revenue</option>
                <option>Weekly revenue</option>
                <option>Orders per day</option>
                <option>Stock level</option>
                <option>Churn probability</option>
                <option>Target attainment</option>
              </select>
            </label>
            <label className={styles.ruleField}>
              <span>Condition</span>
              <select
                value={draft.operator}
                onChange={(e) => setDraft((d) => ({ ...d, operator: e.target.value }))}
              >
                <option>falls below</option>
                <option>rises above</option>
                <option>changes by more than</option>
              </select>
            </label>
            <label className={styles.ruleField}>
              <span>Value</span>
              <input
                type="number"
                min={0}
                value={draft.value}
                onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))}
                required
              />
            </label>
            <label className={styles.ruleField}>
              <span>Notify by</span>
              <select
                value={draft.channel}
                onChange={(e) => setDraft((d) => ({ ...d, channel: e.target.value }))}
              >
                <option>WhatsApp + Email</option>
                <option>WhatsApp</option>
                <option>Email</option>
                <option>In-app</option>
              </select>
            </label>
            <button type="submit" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
              <Check size={13} aria-hidden="true" />
              Create rule
            </button>
          </form>
        ) : null}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Rule</th>
                <th scope="col">Condition</th>
                <th scope="col">Channel</th>
                <th scope="col" className={styles.tdNumHead}>
                  Fired
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className={styles.tdStrong}>{rule.name}</td>
                  <td>{rule.condition}</td>
                  <td>{rule.channel}</td>
                  <td className={styles.tdNum}>{rule.triggered}</td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.pill} ${
                        rule.active ? styles.pillSuccess : styles.pillSecondary
                      }`}
                      onClick={() => toggleRule(rule.id)}
                      disabled={!canEdit}
                      aria-pressed={rule.active}
                      title={canEdit ? "Toggle this rule" : "Your role cannot edit rules"}
                    >
                      {rule.active ? "Active" : "Paused"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!canEdit ? (
          <p className={styles.noteMuted}>
            Your {role} role can read alert rules but not change them. Ask an Owner or Manager to
            adjust a threshold.
          </p>
        ) : null}

        <Explainer title="How do alert rules fire?">
          <p>
            Rules are evaluated once per hour against the live dataset, and immediately on any
            integration webhook. A rule fires at most once per day for the same condition so a
            persistent problem does not flood your phone; the alert stays open until the condition
            clears or you dismiss it.
          </p>
        </Explainer>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Delivery history</h2>
            <p className={styles.panelSub}>Last five notifications sent</p>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Reference</th>
                <th scope="col">Rule</th>
                <th scope="col">Fired at</th>
                <th scope="col">Channel</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {alertHistory.map((log) => (
                <tr key={log.id}>
                  <td className={styles.tdStrong}>{log.id}</td>
                  <td>{log.rule}</td>
                  <td>{log.firedAt}</td>
                  <td>{log.channel}</td>
                  <td>
                    <span
                      className={`${styles.pill} ${
                        log.status === "Delivered" ? styles.pillSuccess : styles.pillWarning
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
