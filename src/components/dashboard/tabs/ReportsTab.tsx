"use client";

import { useState } from "react";
import { Check, Download, FileText, Loader2, Mail, MessageCircle, Plus } from "lucide-react";
import Explainer from "../Explainer";
import { exportDashboardPdf } from "@/lib/pdf";
import { exportRowsToCsv } from "@/lib/csv";
import { KES, monthlySeries, savedReports, type Role } from "@/data/analytics";
import styles from "../dashboard.module.css";

const METRICS = [
  "Revenue",
  "Orders",
  "Average order value",
  "Revenue by branch",
  "Revenue by category",
  "Sales funnel",
  "Top products",
  "Customer acquisition",
  "Churn risk",
  "Inventory and reorder list",
  "Staff performance",
  "Forecast (estimate)",
];

const RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "This month", "This quarter"];
const FREQUENCIES = ["Manual", "Daily", "Weekly", "Monthly"] as const;
const CHANNELS = ["Email", "WhatsApp", "Email + WhatsApp"] as const;

export default function ReportsTab({ role }: { role: Role }) {
  const canSchedule = role === "Owner" || role === "Manager" || role === "Analyst";

  const [selected, setSelected] = useState<string[]>(["Revenue", "Orders", "Top products"]);
  const [range, setRange] = useState(RANGES[1]!);
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>("Weekly");
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("Email + WhatsApp");
  const [recipients, setRecipients] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reports, setReports] = useState(savedReports);

  function toggleMetric(metric: string) {
    setSelected((s) => (s.includes(metric) ? s.filter((m) => m !== metric) : [...s, metric]));
  }

  async function generatePdf() {
    setBusy(true);
    try {
      const months = monthlySeries();
      await exportDashboardPdf({
        title: "Custom business report",
        subtitle: `${range} · ${selected.length} metrics · generated from the DataPulse dashboard`,
        filename: `datapulse-report-${Date.now()}.pdf`,
        summary: [
          ["Period", range],
          ["Metrics included", selected.join(", ") || "None selected"],
          ["Revenue, last full month", KES(months.at(-1)!.revenue)],
          ["Target, last full month", KES(months.at(-1)!.target)],
          [
            "Attainment",
            `${Math.round((months.at(-1)!.revenue / months.at(-1)!.target) * 100)}%`,
          ],
        ],
        table: {
          heading: "Monthly revenue",
          columns: ["Month", "Revenue (KES)", "Target (KES)", "Last year (KES)"],
          rows: months.map((m) => [
            m.label,
            m.revenue.toLocaleString("en-KE"),
            m.target.toLocaleString("en-KE"),
            m.lastYear.toLocaleString("en-KE"),
          ]),
        },
      });
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const months = monthlySeries();
    exportRowsToCsv(
      "datapulse-report.csv",
      ["Month", "Revenue (KES)", "Target (KES)", "Last year (KES)"],
      months.map((m) => [m.label, m.revenue, m.target, m.lastYear])
    );
  }

  function saveSchedule(e: React.FormEvent) {
    e.preventDefault();
    setReports((rs) => [
      {
        id: `RPT-${String(rs.length + 1).padStart(2, "0")}`,
        name: `${selected[0] ?? "Custom"} report`,
        metrics: selected,
        frequency,
        channel,
        recipients: recipients || "you@company.co.ke",
        lastSent: "Not yet sent",
      },
      ...rs,
    ]);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 4000);
  }

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Report builder</h2>
            <p className={styles.panelSub}>
              Choose metrics and a window, then export once or schedule it
            </p>
          </div>
          <div className={styles.panelActions}>
            <button type="button" className={styles.actionBtn} onClick={exportCsv}>
              <Download size={13} aria-hidden="true" />
              CSV
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              onClick={generatePdf}
              disabled={busy}
            >
              {busy ? (
                <Loader2 size={13} className={styles.spin} aria-hidden="true" />
              ) : (
                <FileText size={13} aria-hidden="true" />
              )}
              {busy ? "Generating…" : "Generate PDF"}
            </button>
          </div>
        </div>

        <form onSubmit={saveSchedule}>
          <fieldset className={styles.metricFieldset}>
            <legend className={styles.fieldLegend}>Metrics ({selected.length} selected)</legend>
            <div className={styles.metricGrid}>
              {METRICS.map((metric) => (
                <label
                  key={metric}
                  className={styles.metricChip}
                  data-checked={selected.includes(metric)}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(metric)}
                    onChange={() => toggleMetric(metric)}
                  />
                  {selected.includes(metric) ? (
                    <Check size={13} aria-hidden="true" />
                  ) : (
                    <Plus size={13} aria-hidden="true" />
                  )}
                  {metric}
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.ruleForm} style={{ marginTop: 18 }}>
            <label className={styles.ruleField}>
              <span>Date range</span>
              <select value={range} onChange={(e) => setRange(e.target.value)}>
                {RANGES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <label className={styles.ruleField}>
              <span>Frequency</span>
              <select
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as (typeof FREQUENCIES)[number])
                }
              >
                {FREQUENCIES.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
            <label className={styles.ruleField}>
              <span>Deliver by</span>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as (typeof CHANNELS)[number])}
              >
                {CHANNELS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className={styles.ruleField} style={{ flex: "2 1 240px" }}>
              <span>Recipients</span>
              <input
                type="text"
                placeholder="email@company.co.ke or +254…"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              disabled={!canSchedule || frequency === "Manual"}
              title={
                !canSchedule
                  ? "Your role cannot schedule reports"
                  : frequency === "Manual"
                    ? "Choose a frequency to schedule"
                    : undefined
              }
            >
              <Check size={13} aria-hidden="true" />
              Save schedule
            </button>
          </div>
        </form>

        {saved ? (
          <p className={styles.note}>
            <Check size={13} aria-hidden="true" />
            Schedule saved. The first delivery goes out at the next {frequency.toLowerCase()} run.
          </p>
        ) : null}

        <Explainer title="How are scheduled reports delivered?">
          <p>
            A cron job calls <code>/api/report/generate</code> to render the PDF server-side, then{" "}
            <code>/api/report/deliver</code> sends it. Email goes through the configured SMTP or
            SendGrid transport; WhatsApp uses the WhatsApp Cloud API with a pre-approved template.
            Delivery is retried twice on failure and logged against the schedule.
          </p>
        </Explainer>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Scheduled reports</h2>
            <p className={styles.panelSub}>{reports.length} active schedules</p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Report</th>
                <th scope="col">Metrics</th>
                <th scope="col">Frequency</th>
                <th scope="col">Channel</th>
                <th scope="col">Recipients</th>
                <th scope="col">Last sent</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className={styles.tdStrong}>{report.name}</td>
                  <td>{report.metrics.join(", ")}</td>
                  <td>
                    <span className={`${styles.pill} ${styles.pillInfo}`}>{report.frequency}</span>
                  </td>
                  <td>
                    <span className={styles.channelCell}>
                      {report.channel.includes("WhatsApp") ? (
                        <MessageCircle size={13} aria-hidden="true" />
                      ) : null}
                      {report.channel.includes("Email") ? (
                        <Mail size={13} aria-hidden="true" />
                      ) : null}
                      {report.channel}
                    </span>
                  </td>
                  <td>{report.recipients}</td>
                  <td>{report.lastSent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!canSchedule ? (
          <p className={styles.noteMuted}>
            Your {role} role can download shared reports but not create or schedule new ones.
          </p>
        ) : null}
      </section>
    </>
  );
}
