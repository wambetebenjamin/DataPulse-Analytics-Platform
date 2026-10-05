"use client";

import { useMemo, useState } from "react";
import { Info, TrendingUp } from "lucide-react";
import { ForecastChart } from "@/components/charts";
import Explainer from "../Explainer";
import { exportRowsToCsv } from "@/lib/csv";
import { Download } from "lucide-react";
import {
  KES,
  NUM,
  churnRisk,
  forecastSummary,
  revenueForecast,
  stockoutPredictions,
  type Role,
} from "@/data/analytics";
import styles from "../dashboard.module.css";

type Horizon = 30 | 60 | 90;

const HORIZONS: Horizon[] = [30, 60, 90];

export default function PredictionsTab({ role }: { role: Role }) {
  const [horizon, setHorizon] = useState<Horizon>(30);

  const data = useMemo(() => revenueForecast(horizon), [horizon]);
  const summary = useMemo(() => forecastSummary(horizon), [horizon]);
  const stockouts = useMemo(() => stockoutPredictions().slice(0, 6), []);
  const highChurn = churnRisk.filter((c) => c.risk >= 60);

  const projected = data.filter((p) => p.actual === null && p.forecast !== null);
  const band = projected.at(-1);

  function exportForecast() {
    exportRowsToCsv(
      `datapulse-forecast-${horizon}d.csv`,
      ["Date", "Actual (KES)", "Forecast (KES)", "Lower bound", "Upper bound"],
      data.map((p) => [p.label, p.actual ?? "", p.forecast ?? "", p.lower ?? "", p.upper ?? ""])
    );
  }

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>
              Revenue forecast <span className={styles.estimateTag}>Estimate</span>
            </h2>
            <p className={styles.panelSub}>
              Next {horizon} days, projected from 60 days of trading history
            </p>
          </div>
          <div className={styles.panelActions}>
            <div className={styles.segmented} role="group" aria-label="Forecast horizon">
              {HORIZONS.map((h) => (
                <button
                  key={h}
                  type="button"
                  className={styles.segBtn}
                  data-active={horizon === h}
                  aria-pressed={horizon === h}
                  onClick={() => setHorizon(h)}
                >
                  {h} days
                </button>
              ))}
            </div>
            <button type="button" className={styles.actionBtn} onClick={exportForecast}>
              <Download size={13} aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>

        <div className={styles.kpiGrid}>
          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <div>
                <p className={styles.kpiLabel}>Projected revenue</p>
                <p className={styles.kpiValue}>{KES(summary.projected, true)}</p>
              </div>
              <span className={styles.kpiIcon} style={{ background: "var(--dp-grad-info)" }}>
                <TrendingUp size={19} aria-hidden="true" />
              </span>
            </div>
            <p className={styles.kpiChangeNote}>
              Over the next {horizon} days <span className={styles.estimateTag}>Estimate</span>
            </p>
          </article>
          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <div>
                <p className={styles.kpiLabel}>Model confidence</p>
                <p className={styles.kpiValue}>{summary.confidence}%</p>
              </div>
            </div>
            <p className={styles.kpiChangeNote}>
              Narrower windows forecast more reliably than longer ones
            </p>
          </article>
          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <div>
                <p className={styles.kpiLabel}>Likely range, final day</p>
                <p className={styles.kpiValue}>
                  {band ? `${KES(band.lower ?? 0, true)}–${KES(band.upper ?? 0, true)}` : "—"}
                </p>
              </div>
            </div>
            <p className={styles.kpiChangeNote}>95% prediction interval</p>
          </article>
          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <div>
                <p className={styles.kpiLabel}>Lines at stock-out risk</p>
                <p className={styles.kpiValue}>
                  {NUM(stockouts.filter((s) => s.daysToStockout <= s.leadTimeDays + 7).length)}
                </p>
              </div>
            </div>
            <p className={styles.kpiChangeNote}>Within lead time plus one week</p>
          </article>
        </div>

        <ForecastChart key={horizon} data={data} height={340} />

        <p className={styles.note}>
          <Info size={13} aria-hidden="true" />
          Solid line is actual trading. The dashed line and shaded band are projections, not
          commitments — every figure on this tab is an estimate.
        </p>

        <Explainer title="How is the forecast calculated?">
          <p>
            An ordinary least-squares linear regression is fitted to the last 60 days of daily
            revenue: <code>y = mx + c</code>, where <code>m</code> is the daily trend. The line is
            extended forward across the chosen horizon.
          </p>
          <p>
            The band is a 95% prediction interval,{" "}
            <code>± 1.96 × σ × √(1 + k/n)</code>, where σ is the standard deviation of the
            regression residuals, k is days ahead and n is the number of observations. It widens
            with distance because uncertainty compounds.
          </p>
          <p>
            The model assumes the recent trend continues and has no knowledge of seasonality
            beyond the window, step changes such as opening a branch, or external shocks. Refit
            after any structural change rather than forecasting through it.
          </p>
        </Explainer>
      </section>

      <div className={styles.grid2}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>
                Stock-out predictions <span className={styles.estimateTag}>Estimate</span>
              </h2>
              <p className={styles.panelSub}>Products that will run out first</p>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col" className={styles.tdNumHead}>
                    Days left
                  </th>
                  <th scope="col" className={styles.tdNumHead}>
                    Lead time
                  </th>
                  <th scope="col" className={styles.tdNumHead}>
                    Order
                  </th>
                </tr>
              </thead>
              <tbody>
                {stockouts.map((s) => (
                  <tr key={s.product}>
                    <td className={styles.tdStrong}>{s.product}</td>
                    <td className={styles.tdNum}>
                      <span
                        className={`${styles.pill} ${
                          s.daysToStockout <= s.leadTimeDays
                            ? styles.pillError
                            : s.daysToStockout <= s.leadTimeDays + 7
                              ? styles.pillWarning
                              : styles.pillSuccess
                        }`}
                      >
                        {s.daysToStockout} d
                      </span>
                    </td>
                    <td className={styles.tdNum}>{s.leadTimeDays} d</td>
                    <td className={styles.tdNum}>
                      {s.recommendedOrder > 0 ? NUM(s.recommendedOrder) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Explainer>
            <p>
              A product is urgent when <code>days to stock-out ≤ supplier lead time</code> — order
              today and it still arrives late. The warning band is lead time plus seven days,
              which is the point at which an order can absorb a normal delivery delay.
            </p>
          </Explainer>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>
                Churn probability <span className={styles.estimateTag}>Estimate</span>
              </h2>
              <p className={styles.panelSub}>
                {highChurn.length} accounts above the 60% threshold
              </p>
            </div>
          </div>

          {churnRisk.map((c) => (
            <div className={styles.targetRow} key={c.customer}>
              <div className={styles.targetHead}>
                <span className={styles.targetLabel}>
                  {c.customer}
                  <span className={styles.targetSubLabel}>
                    {c.segment} · {c.lastOrder}
                  </span>
                </span>
                <span className={styles.targetValue}>{c.risk}%</span>
              </div>
              <div
                className={styles.rankBar}
                role="progressbar"
                aria-valuenow={c.risk}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${c.customer} churn risk ${c.risk}%`}
              >
                <span
                  className={styles.rankFill}
                  style={{
                    width: `${c.risk}%`,
                    background:
                      c.risk >= 75
                        ? "var(--dp-grad-error)"
                        : c.risk >= 55
                          ? "var(--dp-grad-warning)"
                          : "var(--dp-grad-info)",
                  }}
                />
              </div>
            </div>
          ))}

          {role === "Viewer" ? (
            <p className={styles.noteMuted}>
              Viewer access — outreach actions are available to Managers and the Owner.
            </p>
          ) : null}
        </section>
      </div>
    </>
  );
}
