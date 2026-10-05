"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { HorizontalBarChart, PALETTE, SERIES_COLORS } from "@/components/charts";
import RangeControl from "../RangeControl";
import Explainer from "../Explainer";
import CalendarHeatmap from "../CalendarHeatmap";
import { exportRowsToCsv } from "@/lib/csv";
import {
  KES,
  NUM,
  RANGE_LABEL,
  products,
  salesFunnel,
  salesReps,
  type RangeKey,
  type Role,
} from "@/data/analytics";
import styles from "../dashboard.module.css";

function funnelColour(rate: number) {
  if (rate >= 60) return PALETTE.info;
  if (rate >= 30) return "#3acaeb";
  if (rate >= 15) return PALETTE.warning;
  return PALETTE.primary;
}

export default function SalesTab({ role }: { role: Role }) {
  const [range, setRange] = useState<RangeKey>("30d");

  const topProducts = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  const maxRevenue = topProducts[0]?.revenue ?? 1;
  const closedWon = salesFunnel.at(-1)!;
  const leads = salesFunnel[0]!;

  function exportReps() {
    exportRowsToCsv(
      "datapulse-sales-reps.csv",
      ["Representative", "Deals closed", "Revenue (KES)", "Win rate %", "Revenue per deal (KES)"],
      salesReps.map((r) => [
        r.name,
        r.deals,
        r.revenue,
        r.winRate,
        Math.round(r.revenue / r.deals),
      ])
    );
  }

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Sales funnel</h2>
            <p className={styles.panelSub}>
              {RANGE_LABEL[range]} · {NUM(leads.count)} leads in, {NUM(closedWon.count)} closed
              won
            </p>
          </div>
          <div className={styles.panelActions}>
            <RangeControl value={range} onChange={setRange} />
          </div>
        </div>

        <div className={styles.grid2}>
          <HorizontalBarChart
            data={salesFunnel}
            yKey="stage"
            barKey="count"
            height={280}
            yWidth={132}
            colorByValue={(row) => funnelColour(Number(row.rate))}
          />

          <div>
            <ul className={styles.stageList}>
              {salesFunnel.map((stage, i) => {
                const previous = salesFunnel[i - 1];
                const stepRate = previous
                  ? Math.round((stage.count / previous.count) * 100)
                  : 100;
                return (
                  <li className={styles.stageItem} key={stage.stage}>
                    <span className={styles.stageName}>{stage.stage}</span>
                    <span className={styles.stageNums}>
                      <span className={styles.stageCount}>{NUM(stage.count)}</span>
                      <span className={styles.stageRate}>{stage.rate}% of all leads</span>
                      {previous ? (
                        <span className={styles.stageStep}>{stepRate}% step conversion</span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>

            <Explainer title="How is conversion calculated?">
              <p>
                Two rates are shown. <code>Overall % = stage count ÷ leads captured × 100</code>{" "}
                measures the whole funnel. <code>Step % = stage count ÷ previous stage × 100</code>{" "}
                isolates where leads actually fall out. A healthy funnel has no single step below
                about 40% — the sharpest drop here is the one worth a conversation.
              </p>
            </Explainer>
          </div>
        </div>
      </section>

      <div className={styles.grid2}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Top products by revenue</h2>
              <p className={styles.panelSub}>{RANGE_LABEL[range]}</p>
            </div>
          </div>
          <div className={styles.ranked}>
            {topProducts.map((p, i) => (
              <div className={styles.rankItem} key={p.name}>
                <span className={styles.rankNum}>{i + 1}</span>
                <div className={styles.rankBody}>
                  <p className={styles.rankName}>
                    {p.name}
                    <span className={styles.rankValue}>{KES(p.revenue, true)}</span>
                  </p>
                  <div className={styles.rankBar}>
                    <span
                      className={styles.rankFill}
                      style={{
                        width: `${(p.revenue / maxRevenue) * 100}%`,
                        background: SERIES_COLORS[i % SERIES_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Sales team performance</h2>
              <p className={styles.panelSub}>Deals closed, revenue and win rate</p>
            </div>
            <div className={styles.panelActions}>
              <button type="button" className={styles.actionBtn} onClick={exportReps}>
                <Download size={13} aria-hidden="true" />
                Export CSV
              </button>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Representative</th>
                  <th scope="col" className={styles.tdNumHead}>
                    Deals
                  </th>
                  <th scope="col" className={styles.tdNumHead}>
                    Revenue
                  </th>
                  <th scope="col" className={styles.tdNumHead}>
                    Win rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {salesReps.map((rep) => {
                  const pct = rep.winRate;
                  return (
                    <tr key={rep.name}>
                      <td className={styles.tdStrong}>{rep.name}</td>
                      <td className={styles.tdNum}>{rep.deals}</td>
                      <td className={styles.tdNum}>{KES(rep.revenue, true)}</td>
                      <td className={styles.tdNum}>
                        <span
                          className={`${styles.pill} ${
                            pct >= 35
                              ? styles.pillSuccess
                              : pct >= 28
                                ? styles.pillWarning
                                : styles.pillError
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {role === "Viewer" ? (
            <p className={styles.noteMuted}>
              Viewer access — individual performance is shown in summary only.
            </p>
          ) : null}
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Sales peaks</h2>
            <p className={styles.panelSub}>
              Revenue intensity by day — darker is busier. Last 12 weeks.
            </p>
          </div>
        </div>
        <CalendarHeatmap />
        <Explainer title="How is the heatmap built?">
          <p>
            Each cell is one trading day, shaded by{" "}
            <code>day revenue ÷ highest day revenue in the window</code>. Closed days are left
            blank rather than shown as zero, so a public holiday does not distort the scale. Use
            it for staffing and delivery windows rather than for totals.
          </p>
        </Explainer>
      </section>
    </>
  );
}
