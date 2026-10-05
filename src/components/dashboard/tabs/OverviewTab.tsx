"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Bell, Download, Info } from "lucide-react";
import {
  ChartLegend,
  DonutChart,
  GradientLineChart,
  PALETTE,
  SERIES_COLORS,
} from "@/components/charts";
import KpiCard from "../KpiCard";
import RangeControl from "../RangeControl";
import Explainer from "../Explainer";
import { exportRowsToCsv } from "@/lib/csv";
import { useReveal } from "@/lib/hooks";
import {
  KES,
  RANGE_LABEL,
  RANGE_DAYS,
  alerts,
  buildDailySeries,
  kpis,
  monthlySeries,
  revenueByCategory,
  revenueTargets,
  transactions,
  weeklySeries,
  type RangeKey,
} from "@/data/analytics";
import type { Role } from "@/data/analytics";
import styles from "../dashboard.module.css";

type Grain = "daily" | "weekly" | "monthly";

const GRAINS: { key: Grain; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

const SEVERITY_ICON = { critical: AlertTriangle, warning: Bell, info: Info } as const;

export default function OverviewTab({ role }: { role: Role }) {
  const [range, setRange] = useState<RangeKey>("30d");
  const [grain, setGrain] = useState<Grain>("daily");
  const alertsReveal = useReveal<HTMLDivElement>();

  const cards = useMemo(() => kpis(range), [range]);

  const series = useMemo(() => {
    if (grain === "monthly") return monthlySeries();
    if (grain === "weekly") return weeklySeries();
    return buildDailySeries(RANGE_DAYS[range]);
  }, [grain, range]);

  const donutTotal = revenueByCategory.reduce((a, b) => a + b.revenue, 0);

  function exportTransactions() {
    exportRowsToCsv(
      `datapulse-transactions-${range}.csv`,
      ["Transaction", "Customer", "Channel", "Amount (KES)", "Status", "Time"],
      transactions.map((t) => [t.id, t.customer, t.channel, t.amount, t.status, t.time])
    );
  }

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Business at a glance</h2>
            <p className={styles.panelSub}>
              {RANGE_LABEL[range]} · compared with the preceding period of equal length
            </p>
          </div>
          <div className={styles.panelActions}>
            <RangeControl value={range} onChange={setRange} />
          </div>
        </div>

        <div className={styles.kpiGrid}>
          {cards.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} previousLabel="previous period" />
          ))}
        </div>

        <Explainer title="How are these calculated?">
          <p>
            Each figure sums the selected window and compares it with the window of equal length
            immediately before it. <code>Average order value = total revenue ÷ completed orders</code>.
            Refunded and pending transactions are excluded from revenue but counted in orders, so
            a refund-heavy day lowers AOV rather than hiding itself.
          </p>
        </Explainer>
      </section>

      <div className={styles.grid2}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Revenue trend</h2>
              <p className={styles.panelSub}>
                {grain === "monthly"
                  ? "Last 12 months"
                  : grain === "weekly"
                    ? "Last 8 weeks"
                    : RANGE_LABEL[range]}
              </p>
            </div>
            <div className={styles.panelActions}>
              <div className={styles.segmented} role="tablist" aria-label="Revenue granularity">
                {GRAINS.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    role="tab"
                    aria-selected={grain === g.key}
                    className={styles.segBtn}
                    data-active={grain === g.key}
                    onClick={() => setGrain(g.key)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* key forces a remount so the line redraws left-to-right on tab change */}
          <GradientLineChart
            key={`${grain}-${range}`}
            data={series}
            xKey="label"
            series={[{ key: "revenue", name: "Revenue", color: PALETTE.info }]}
            height={300}
            currency
          />
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Revenue by category</h2>
              <p className={styles.panelSub}>Share of {KES(donutTotal, true)} in the period</p>
            </div>
          </div>
          <DonutChart
            data={revenueByCategory}
            nameKey="category"
            valueKey="revenue"
            height={236}
            suffix=""
            centerValue={KES(donutTotal, true)}
            centerLabel="Total"
          />
          <ChartLegend
            items={revenueByCategory.map((c, i) => ({
              label: c.category,
              color: SERIES_COLORS[i % SERIES_COLORS.length]!,
              value: `${Math.round((c.revenue / donutTotal) * 100)}%`,
            }))}
          />
        </section>
      </div>

      <div className={styles.grid2}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Targets versus actuals</h2>
              <p className={styles.panelSub}>October, by branch</p>
            </div>
          </div>

          {revenueTargets.map((t) => {
            const pct = Math.round((t.actual / t.target) * 100);
            return (
              <div className={styles.targetRow} key={t.label}>
                <div className={styles.targetHead}>
                  <span className={styles.targetLabel}>{t.label}</span>
                  <span className={styles.targetValue}>
                    {KES(t.actual, true)} / {KES(t.target, true)}
                    <span className={styles.targetPct} data-over={pct >= 100}>
                      {pct}%
                    </span>
                  </span>
                </div>
                <div
                  className={styles.rankBar}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${t.label} at ${pct}% of target`}
                >
                  <span
                    className={styles.rankFill}
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      background: pct >= 100 ? "var(--dp-grad-success)" : "var(--dp-grad-info)",
                    }}
                  />
                </div>
              </div>
            );
          })}

          <Explainer title="How is attainment calculated?">
            <p>
              <code>Attainment % = actual revenue ÷ target revenue × 100</code>, using completed
              transactions only. Targets are set per branch in Settings and are pro-rated for
              part-months so a target set mid-period is not unfairly inflated.
            </p>
          </Explainer>
        </section>

        <section className={styles.panel} ref={alertsReveal.ref} data-visible={alertsReveal.visible}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Active alerts</h2>
              <p className={styles.panelSub}>Severity-coded, newest first</p>
            </div>
            <div className={styles.panelActions}>
              <Link href="/app/dashboard/alerts" className={styles.actionBtn}>
                All alerts
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <ul className={styles.alertList}>
            {alerts.slice(0, 4).map((alert, i) => {
              const Icon = SEVERITY_ICON[alert.severity];
              return (
                <li
                  key={alert.id}
                  className={`${styles.alertItem} dp-reveal-right`}
                  data-sev={alert.severity}
                  data-visible={alertsReveal.visible}
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
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Last 10 transactions</h2>
            <p className={styles.panelSub}>Live from connected payment channels</p>
          </div>
          <div className={styles.panelActions}>
            <button type="button" className={styles.actionBtn} onClick={exportTransactions}>
              <Download size={13} aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Transaction</th>
                <th scope="col">Customer</th>
                <th scope="col">Channel</th>
                <th scope="col" className={styles.tdNumHead}>
                  Amount
                </th>
                <th scope="col">Status</th>
                <th scope="col" className={styles.tdNumHead}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className={styles.tdStrong}>{t.id}</td>
                  <td>{t.customer}</td>
                  <td>{t.channel}</td>
                  <td className={styles.tdNum}>{KES(t.amount)}</td>
                  <td>
                    <span
                      className={`${styles.pill} ${
                        t.status === "Completed"
                          ? styles.pillSuccess
                          : t.status === "Pending"
                            ? styles.pillWarning
                            : styles.pillError
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className={styles.tdNum}>{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {role === "Viewer" ? (
          <p className={styles.noteMuted}>
            You are signed in as a Viewer. Figures are read-only and exports are limited to the
            panels shared with you.
          </p>
        ) : null}
      </section>
    </>
  );
}
