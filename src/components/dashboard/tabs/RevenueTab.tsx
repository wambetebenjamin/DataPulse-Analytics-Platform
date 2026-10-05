"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  ChartLegend,
  DonutChart,
  GradientLineChart,
  GroupedBarChart,
  PALETTE,
  SERIES_COLORS,
} from "@/components/charts";
import KpiCard from "../KpiCard";
import RangeControl from "../RangeControl";
import Explainer from "../Explainer";
import { exportRowsToCsv } from "@/lib/csv";
import {
  KES,
  RANGE_DAYS,
  RANGE_LABEL,
  buildDailySeries,
  kpis,
  monthlySeries,
  revenueByCategory,
  revenueTargets,
  weeklySeries,
  type RangeKey,
  type Role,
} from "@/data/analytics";
import styles from "../dashboard.module.css";

type Grain = "daily" | "weekly" | "monthly";

const GRAINS: { key: Grain; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

/** Payment channel mix — derived from the transaction stream in production. */
const CHANNEL_MIX = [
  { channel: "M-Pesa", value: 58, color: PALETTE.success },
  { channel: "Bank transfer", value: 21, color: PALETTE.info },
  { channel: "Card", value: 13, color: PALETTE.primary },
  { channel: "Cash", value: 8, color: PALETTE.dark },
];

export default function RevenueTab({ role }: { role: Role }) {
  const [range, setRange] = useState<RangeKey>("30d");
  const [grain, setGrain] = useState<Grain>("daily");

  const cards = useMemo(() => kpis(range).slice(0, 2), [range]);
  const months = monthlySeries();
  const donutTotal = revenueByCategory.reduce((a, b) => a + b.revenue, 0);

  const series = useMemo(() => {
    if (grain === "monthly") return months;
    if (grain === "weekly") return weeklySeries();
    return buildDailySeries(RANGE_DAYS[range]);
  }, [grain, range, months]);

  const periodTotal = series.reduce((a, b) => a + (b.revenue ?? 0), 0);
  const bestMonth = months.reduce((a, b) => (b.revenue > a.revenue ? b : a));

  function exportMonths() {
    exportRowsToCsv(
      "datapulse-revenue-monthly.csv",
      ["Month", "Revenue (KES)", "Target (KES)", "Last year (KES)", "Attainment %", "YoY %"],
      months.map((m) => [
        m.label,
        m.revenue,
        m.target,
        m.lastYear,
        Math.round((m.revenue / m.target) * 100),
        Math.round(((m.revenue - m.lastYear) / m.lastYear) * 100),
      ])
    );
  }

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Revenue performance</h2>
            <p className={styles.panelSub}>
              {RANGE_LABEL[range]} · {KES(periodTotal)} across all channels
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
          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <div>
                <p className={styles.kpiLabel}>Best month</p>
                <p className={styles.kpiValue}>{KES(bestMonth.revenue, true)}</p>
              </div>
            </div>
            <p className={styles.kpiChangeNote}>
              {bestMonth.label} · {Math.round((bestMonth.revenue / bestMonth.target) * 100)}% of
              target
            </p>
          </article>
          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <div>
                <p className={styles.kpiLabel}>Year on year</p>
                <p className={styles.kpiValue}>
                  +
                  {Math.round(
                    ((months.at(-1)!.revenue - months.at(-1)!.lastYear) /
                      months.at(-1)!.lastYear) *
                      100
                  )}
                  %
                </p>
              </div>
            </div>
            <p className={styles.kpiChangeNote}>
              October against the same month last year
            </p>
          </article>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Revenue over time</h2>
            <p className={styles.panelSub}>
              {grain === "monthly"
                ? "Last 12 months"
                : grain === "weekly"
                  ? "Last 8 weeks"
                  : RANGE_LABEL[range]}
            </p>
          </div>
          <div className={styles.panelActions}>
            <div className={styles.segmented} role="tablist" aria-label="Granularity">
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

        <GradientLineChart
          key={`${grain}-${range}`}
          data={series}
          xKey="label"
          series={[{ key: "revenue", name: "Revenue", color: PALETTE.info }]}
          height={320}
          currency
        />
      </section>

      <div className={styles.grid2}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Actual, target and last year</h2>
              <p className={styles.panelSub}>Monthly, KES</p>
            </div>
          </div>
          <GroupedBarChart
            data={months}
            xKey="label"
            series={[
              { key: "revenue", name: "Actual", color: PALETTE.info },
              { key: "target", name: "Target", color: PALETTE.dark },
              { key: "lastYear", name: "Last year", color: PALETTE.secondary },
            ]}
            height={300}
            currency
          />
          <Explainer>
            <p>
              Actual is the sum of completed transactions in the month. Target comes from the
              figure set per branch in Settings. Last year is the same calendar month twelve
              months earlier, unadjusted for inflation — compare trading, not purchasing power.
            </p>
          </Explainer>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Payment channel mix</h2>
              <p className={styles.panelSub}>Share of transaction value</p>
            </div>
          </div>
          <DonutChart
            data={CHANNEL_MIX}
            nameKey="channel"
            valueKey="value"
            height={240}
            centerValue="58%"
            centerLabel="M-Pesa"
          />
          <ChartLegend
            items={CHANNEL_MIX.map((c) => ({
              label: c.channel,
              color: c.color,
              value: `${c.value}%`,
            }))}
          />
        </section>
      </div>

      <div className={styles.grid2}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Revenue by category</h2>
              <p className={styles.panelSub}>Period total {KES(donutTotal)}</p>
            </div>
          </div>
          <div className={styles.ranked}>
            {revenueByCategory.map((c, i) => {
              const pct = (c.revenue / donutTotal) * 100;
              return (
                <div className={styles.rankItem} key={c.category}>
                  <span className={styles.rankNum}>{i + 1}</span>
                  <div className={styles.rankBody}>
                    <p className={styles.rankName}>
                      {c.category}
                      <span className={styles.rankValue}>{KES(c.revenue, true)}</span>
                    </p>
                    <div className={styles.rankBar}>
                      <span
                        className={styles.rankFill}
                        style={{
                          width: `${pct}%`,
                          background: SERIES_COLORS[i % SERIES_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Target attainment</h2>
              <p className={styles.panelSub}>Quarter to date</p>
            </div>
            <div className={styles.panelActions}>
              <button type="button" className={styles.actionBtn} onClick={exportMonths}>
                <Download size={13} aria-hidden="true" />
                Export CSV
              </button>
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

          {role === "Viewer" ? (
            <p className={styles.noteMuted}>
              Viewer access — targets are read-only and are maintained by a Manager or the Owner.
            </p>
          ) : null}
        </section>
      </div>
    </>
  );
}
