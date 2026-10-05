"use client";

import { useMemo, useState } from "react";
import { Download, MessageCircle } from "lucide-react";
import {
  ChartLegend,
  DonutChart,
  GroupedBarChart,
  PALETTE,
  VerticalBarChart,
} from "@/components/charts";
import KpiCard from "../KpiCard";
import RangeControl from "../RangeControl";
import Explainer from "../Explainer";
import CustomerMap from "../CustomerMap";
import { exportRowsToCsv } from "@/lib/csv";
import { whatsappLink } from "@/data/site";
import {
  KES,
  NUM,
  RANGE_LABEL,
  acquisition,
  churnRisk,
  clvDistribution,
  kpis,
  newVsReturning,
  type RangeKey,
  type Role,
} from "@/data/analytics";
import styles from "../dashboard.module.css";

export default function CustomersTab({ role }: { role: Role }) {
  const [range, setRange] = useState<RangeKey>("30d");
  const cards = useMemo(() => kpis(range).filter((k) => k.icon === "customers"), [range]);

  const totalCustomers = clvDistribution.reduce((a, b) => a + b.customers, 0);
  const highValue = clvDistribution
    .slice(-3)
    .reduce((a, b) => a + b.customers, 0);

  function exportChurn() {
    exportRowsToCsv(
      "datapulse-churn-risk.csv",
      ["Customer", "Segment", "Last order", "Lifetime value (KES)", "Churn risk %"],
      churnRisk.map((c) => [c.customer, c.segment, c.lastOrder, c.lifetimeValue, c.risk])
    );
  }

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Customer base</h2>
            <p className={styles.panelSub}>
              {RANGE_LABEL[range]} · {NUM(totalCustomers)} customers with a recorded purchase
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
                <p className={styles.kpiLabel}>Repeat rate</p>
                <p className={styles.kpiValue}>
                  {Math.round(
                    (newVsReturning.at(-1)!.returning /
                      (newVsReturning.at(-1)!.returning + newVsReturning.at(-1)!.newCustomers)) *
                      100
                  )}
                  %
                </p>
              </div>
            </div>
            <p className={styles.kpiChangeNote}>Share of October buyers who had bought before</p>
          </article>
          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <div>
                <p className={styles.kpiLabel}>High-value customers</p>
                <p className={styles.kpiValue}>{NUM(highValue)}</p>
              </div>
            </div>
            <p className={styles.kpiChangeNote}>Lifetime value above KES 50,000</p>
          </article>
          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <div>
                <p className={styles.kpiLabel}>At churn risk</p>
                <p className={styles.kpiValue}>{churnRisk.filter((c) => c.risk >= 60).length}</p>
              </div>
            </div>
            <p className={styles.kpiChangeNote}>
              Accounts scoring 60% or above <span className={styles.estimateTag}>Estimate</span>
            </p>
          </article>
        </div>
      </section>

      <div className={styles.grid2}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>New versus returning</h2>
              <p className={styles.panelSub}>Buyers per month</p>
            </div>
          </div>
          <GroupedBarChart
            data={newVsReturning}
            xKey="label"
            series={[
              { key: "newCustomers", name: "New", color: PALETTE.primary },
              { key: "returning", name: "Returning", color: PALETTE.info },
            ]}
            height={280}
          />
          <Explainer title="How is a returning customer defined?">
            <p>
              A buyer is <strong>returning</strong> if the same identifier — M-Pesa payer number,
              account or card token — appears on a completed transaction in any earlier month.
              Everyone else is new. Walk-in cash sales without an identifier are excluded from
              both series rather than guessed at.
            </p>
          </Explainer>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Acquisition channels</h2>
              <p className={styles.panelSub}>Where new customers came from</p>
            </div>
          </div>
          <DonutChart
            data={acquisition}
            nameKey="channel"
            valueKey="value"
            height={240}
            centerValue={`${acquisition[0]!.value}%`}
            centerLabel={acquisition[0]!.channel}
          />
          <ChartLegend
            items={acquisition.map((a) => ({
              label: a.channel,
              color: a.color,
              value: `${a.value}%`,
            }))}
          />
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Customer lifetime value distribution</h2>
            <p className={styles.panelSub}>Customers per value band, KES</p>
          </div>
        </div>
        <VerticalBarChart
          data={clvDistribution}
          xKey="band"
          barKey="customers"
          color={PALETTE.info}
          height={260}
        />
        <Explainer title="How is lifetime value calculated?">
          <p>
            <code>CLV = sum of all completed transaction values per customer</code>, to date and
            not discounted. It is historic, not predictive — it tells you what a customer{" "}
            <em>has</em> been worth. The long tail on the left is normal; the question worth
            asking is whether the bands on the right are growing month on month.
          </p>
        </Explainer>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Where your customers are</h2>
            <p className={styles.panelSub}>Clustered by ward and county</p>
          </div>
        </div>
        <CustomerMap />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Churn risk</h2>
            <p className={styles.panelSub}>
              Accounts most likely to stop buying{" "}
              <span className={styles.estimateTag}>Estimate</span>
            </p>
          </div>
          <div className={styles.panelActions}>
            <button type="button" className={styles.actionBtn} onClick={exportChurn}>
              <Download size={13} aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Segment</th>
                <th scope="col">Last order</th>
                <th scope="col" className={styles.tdNumHead}>
                  Lifetime value
                </th>
                <th scope="col" className={styles.tdNumHead}>
                  Risk
                </th>
                {role !== "Viewer" ? <th scope="col">Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {churnRisk.map((c) => (
                <tr key={c.customer}>
                  <td className={styles.tdStrong}>{c.customer}</td>
                  <td>{c.segment}</td>
                  <td>{c.lastOrder}</td>
                  <td className={styles.tdNum}>{KES(c.lifetimeValue, true)}</td>
                  <td className={styles.tdNum}>
                    <span
                      className={`${styles.pill} ${
                        c.risk >= 75
                          ? styles.pillError
                          : c.risk >= 55
                            ? styles.pillWarning
                            : styles.pillInfo
                      }`}
                    >
                      {c.risk}%
                    </span>
                  </td>
                  {role !== "Viewer" ? (
                    <td>
                      <a
                        className={styles.actionBtn}
                        href={whatsappLink(
                          `Hello ${c.customer}, it has been a while since your last order with us. Can we help with anything?`
                        )}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <MessageCircle size={13} aria-hidden="true" />
                        Reach out
                      </a>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Explainer title="How is churn risk calculated?">
          <p>
            A weighted score, not a certainty. <code>Risk = 0.5 × recency + 0.3 × frequency drop
            + 0.2 × value trend</code>, where recency is days since last order relative to that
            customer&rsquo;s own normal gap between orders. A customer who always buys quarterly
            is not flagged at 60 days; one who always bought weekly is. Treat it as a call list,
            not a verdict.
          </p>
        </Explainer>
      </section>
    </>
  );
}
