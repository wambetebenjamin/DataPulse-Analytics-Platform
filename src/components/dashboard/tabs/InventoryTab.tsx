"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Download, PackageCheck } from "lucide-react";
import { PALETTE, VerticalBarChart } from "@/components/charts";
import Explainer from "../Explainer";
import { exportRowsToCsv } from "@/lib/csv";
import { KES, NUM, products, stockoutPredictions, type Role } from "@/data/analytics";
import styles from "../dashboard.module.css";

type Filter = "all" | "low" | "healthy";

export default function InventoryTab({ role }: { role: Role }) {
  const [filter, setFilter] = useState<Filter>("all");
  const predictions = useMemo(() => stockoutPredictions(), []);

  const lowStock = products.filter((p) => p.stock <= p.reorderPoint);
  const stockValue = products.reduce((a, p) => a + p.stock * (p.revenue / Math.max(p.units, 1)), 0);

  const rows = products.filter((p) =>
    filter === "low"
      ? p.stock <= p.reorderPoint
      : filter === "healthy"
        ? p.stock > p.reorderPoint
        : true
  );

  const supplierLeadTimes = useMemo(() => {
    const map = new Map<string, { supplier: string; days: number[]; products: number }>();
    products.forEach((p) => {
      const entry = map.get(p.supplier) ?? { supplier: p.supplier, days: [], products: 0 };
      entry.days.push(p.leadTimeDays);
      entry.products += 1;
      map.set(p.supplier, entry);
    });
    return Array.from(map.values())
      .map((e) => ({
        supplier: e.supplier,
        products: e.products,
        average: Math.round((e.days.reduce((a, b) => a + b, 0) / e.days.length) * 10) / 10,
        spread: Math.max(...e.days) - Math.min(...e.days),
      }))
      .sort((a, b) => b.average - a.average);
  }, []);

  function exportStock() {
    exportRowsToCsv(
      "datapulse-inventory.csv",
      [
        "Product",
        "Stock on hand",
        "Reorder point",
        "Daily velocity",
        "Days to stock-out",
        "Supplier",
        "Lead time (days)",
      ],
      predictions.map((p) => {
        const source = products.find((x) => x.name === p.product)!;
        return [
          p.product,
          p.stock,
          source.reorderPoint,
          p.velocity,
          p.daysToStockout,
          source.supplier,
          p.leadTimeDays,
        ];
      })
    );
  }

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Stock position</h2>
            <p className={styles.panelSub}>
              {NUM(products.length)} tracked lines · approximately {KES(stockValue, true)} of
              inventory at retail value
            </p>
          </div>
          <div className={styles.panelActions}>
            <div className={styles.segmented} role="group" aria-label="Filter stock">
              {(["all", "low", "healthy"] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={styles.segBtn}
                  data-active={filter === f}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All" : f === "low" ? `Low (${lowStock.length})` : "Healthy"}
                </button>
              ))}
            </div>
            <button type="button" className={styles.actionBtn} onClick={exportStock}>
              <Download size={13} aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>

        <div className={styles.ranked}>
          {rows.map((p) => {
            const pct = Math.min(100, (p.stock / Math.max(p.reorderPoint * 2, 1)) * 100);
            const low = p.stock <= p.reorderPoint;
            return (
              <div className={styles.rankItem} key={p.name}>
                <span
                  className={styles.rankNum}
                  style={low ? { background: "var(--dp-grad-warning)" } : undefined}
                  aria-hidden="true"
                >
                  {low ? <AlertTriangle size={13} /> : <PackageCheck size={13} />}
                </span>
                <div className={styles.rankBody}>
                  <p className={styles.rankName}>
                    {p.name}
                    <span className={styles.rankValue}>
                      {NUM(p.stock)} / reorder at {NUM(p.reorderPoint)}
                    </span>
                  </p>
                  <div className={styles.rankBar}>
                    <span
                      className={styles.rankFill}
                      style={{
                        width: `${pct}%`,
                        background: low ? "var(--dp-grad-warning)" : "var(--dp-grad-success)",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className={styles.grid2}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Days to stock-out</h2>
              <p className={styles.panelSub}>
                Soonest first <span className={styles.estimateTag}>Estimate</span>
              </p>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col" className={styles.tdNumHead}>
                    On hand
                  </th>
                  <th scope="col" className={styles.tdNumHead}>
                    Per day
                  </th>
                  <th scope="col" className={styles.tdNumHead}>
                    Days left
                  </th>
                  <th scope="col" className={styles.tdNumHead}>
                    Order now
                  </th>
                </tr>
              </thead>
              <tbody>
                {predictions.slice(0, 8).map((p) => (
                  <tr key={p.product}>
                    <td className={styles.tdStrong}>{p.product}</td>
                    <td className={styles.tdNum}>{NUM(p.stock)}</td>
                    <td className={styles.tdNum}>{p.velocity}</td>
                    <td className={styles.tdNum}>
                      <span
                        className={`${styles.pill} ${
                          p.daysToStockout <= p.leadTimeDays
                            ? styles.pillError
                            : p.daysToStockout <= p.leadTimeDays + 7
                              ? styles.pillWarning
                              : styles.pillSuccess
                        }`}
                      >
                        {p.daysToStockout} d
                      </span>
                    </td>
                    <td className={styles.tdNum}>
                      {p.recommendedOrder > 0 ? NUM(p.recommendedOrder) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Explainer>
            <p>
              <code>Days to stock-out = units on hand ÷ average daily units sold (30 days)</code>.
              The recommended order quantity covers the supplier lead time plus a ten-day buffer:{" "}
              <code>velocity × (lead time + 10) − stock on hand</code>. Days you were closed are
              excluded from the velocity average so a holiday does not inflate your cover.
            </p>
          </Explainer>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Supplier lead times</h2>
              <p className={styles.panelSub}>Average days from order to delivery</p>
            </div>
          </div>

          <VerticalBarChart
            data={supplierLeadTimes}
            xKey="supplier"
            barKey="average"
            color={PALETTE.dark}
            height={240}
          />

          <div className={styles.tableWrap} style={{ marginTop: 14 }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Supplier</th>
                  <th scope="col" className={styles.tdNumHead}>
                    Lines
                  </th>
                  <th scope="col" className={styles.tdNumHead}>
                    Avg days
                  </th>
                  <th scope="col" className={styles.tdNumHead}>
                    Spread
                  </th>
                </tr>
              </thead>
              <tbody>
                {supplierLeadTimes.map((s) => (
                  <tr key={s.supplier}>
                    <td className={styles.tdStrong}>{s.supplier}</td>
                    <td className={styles.tdNum}>{s.products}</td>
                    <td className={styles.tdNum}>{s.average}</td>
                    <td className={styles.tdNum}>
                      {s.spread === 0 ? (
                        <span className={`${styles.pill} ${styles.pillSuccess}`}>Consistent</span>
                      ) : (
                        `± ${s.spread} d`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Explainer title="Why does spread matter more than average?">
            <p>
              Safety stock is driven by variability, not by the mean. A supplier averaging 14 days
              with a two-day spread is cheaper to work with than one averaging 10 days with a
              twelve-day spread, because the second forces you to hold weeks of buffer against
              their unreliability. Price that buffer before renegotiating.
            </p>
          </Explainer>
        </section>
      </div>

      {role === "Viewer" ? (
        <p className={styles.noteMuted}>
          Viewer access — reorder actions are available to Managers and the Owner.
        </p>
      ) : null}
    </>
  );
}
