"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarRange,
  Download,
  Info,
  Loader2,
  TrendingUp,
  X,
} from "lucide-react";
import {
  ChartLegend,
  DonutChart,
  GradientLineChart,
  HorizontalBarChart,
  PALETTE,
} from "@/components/charts";
import KpiCard from "./KpiCard";
import {
  acquisition,
  alerts,
  buildDailySeries,
  KES,
  kpis,
  products,
  RANGE_DAYS,
  RANGE_LABEL,
  salesFunnel,
  type RangeKey,
} from "@/data/analytics";
import { useReveal } from "@/lib/hooks";
import { exportDashboardPdf } from "@/lib/pdf";
import styles from "./dashboard.module.css";
import demo from "./demo.module.css";

const RANGES: RangeKey[] = ["7d", "30d", "90d", "custom"];

export default function DemoDashboard() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [bannerOpen, setBannerOpen] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { ref: alertsRef, visible: alertsVisible } = useReveal<HTMLDivElement>(0.1);

  const series = useMemo(() => buildDailySeries(RANGE_DAYS[range]), [range]);
  const cards = useMemo(() => kpis(range), [range]);

  const topProducts = useMemo(
    () => [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 6),
    []
  );
  const maxProductRevenue = topProducts[0]?.revenue ?? 1;

  const totalRevenue = series.reduce((a, b) => a + b.revenue, 0);

  async function handleExport() {
    setExporting(true);
    try {
      await exportDashboardPdf({
        title: "DataPulse Analytics — Demo Dashboard",
        subtitle: `${RANGE_LABEL[range]} · Sample data, Nairobi retail & services`,
        elementId: "demo-dashboard-capture",
        filename: `datapulse-demo-${range}.pdf`,
        summary: [
          ["Period", RANGE_LABEL[range]],
          ["Total revenue", KES(totalRevenue)],
          ["Orders completed", String(series.reduce((a, b) => a + b.orders, 0))],
          ["New customers", String(series.reduce((a, b) => a + b.customers, 0))],
          [
            "Avg order value",
            KES(Math.round(totalRevenue / Math.max(series.reduce((a, b) => a + b.orders, 0), 1))),
          ],
        ],
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className={demo.wrap}>
      {/* Persistent CTA banner at the top of the demo page (brief) */}
      {bannerOpen && (
        <div className={demo.banner} role="region" aria-label="Demo notice">
          <span className={demo.bannerIcon} aria-hidden="true">
            <Info size={16} />
          </span>
          <p className={demo.bannerText}>
            <strong>This is a demo with sample data.</strong> Sign up for real insights.
          </p>
          <Link href="/signup" className={demo.bannerCta}>
            Start Free Trial
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className={demo.bannerClose}
            aria-label="Dismiss demo notice"
            onClick={() => setBannerOpen(false)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* toolbar */}
      <div className={demo.toolbar}>
        <div className={demo.toolbarLeft}>
          <h2 className={demo.toolbarTitle}>Business overview</h2>
          <p className={demo.toolbarSub}>
            Acacia Retail Group · Nairobi, Mombasa &amp; Nakuru · {RANGE_LABEL[range]}
          </p>
        </div>

        <div className={demo.toolbarRight}>
          <div className={styles.segmented} role="group" aria-label="Date range filter">
            <span className={demo.rangeIcon} aria-hidden="true">
              <CalendarRange size={14} />
            </span>
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                className={styles.segBtn}
                data-active={range === r}
                aria-pressed={range === r}
                onClick={() => setRange(r)}
              >
                {r === "custom" ? "Custom" : RANGE_LABEL[r].replace("Last ", "")}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 size={14} className={demo.spin} aria-hidden="true" />
            ) : (
              <Download size={14} aria-hidden="true" />
            )}
            {exporting ? "Generating" : "Export PDF"}
          </button>
        </div>
      </div>

      <div id="demo-dashboard-capture" className={styles.stack}>
        {/* KPI row */}
        <div className={styles.kpiGrid}>
          {cards.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} previousLabel="previous period" />
          ))}
        </div>

        {/* revenue overview */}
        <section className={styles.panel} aria-labelledby="demo-rev">
          <div className={styles.panelHead}>
            <div>
              <h3 id="demo-rev" className={styles.panelTitle}>
                Revenue overview
              </h3>
              <p className={styles.panelSub}>
                Daily revenue in KES across all branches · {RANGE_LABEL[range]}
              </p>
            </div>
            <span className={styles.pill + " " + styles.pillSuccess}>
              <TrendingUp size={12} aria-hidden="true" />
              {KES(totalRevenue, true)} total
            </span>
          </div>
          <GradientLineChart
            data={series}
            xKey="label"
            series={[{ key: "revenue", name: "Revenue", color: PALETTE.info }]}
            height={300}
          />
        </section>

        {/* funnel + acquisition */}
        <div className={styles.grid2}>
          <section className={styles.panel} aria-labelledby="demo-funnel">
            <div className={styles.panelHead}>
              <div>
                <h3 id="demo-funnel" className={styles.panelTitle}>
                  Sales funnel
                </h3>
                <p className={styles.panelSub}>Lead to closed deal, with conversion per stage</p>
              </div>
            </div>
            <HorizontalBarChart
              data={salesFunnel}
              yKey="stage"
              barKey="count"
              height={260}
              yWidth={126}
              colorByValue={(row) => {
                const rate = Number(row.rate);
                if (rate >= 60) return PALETTE.info;
                if (rate >= 30) return "#3acaeb";
                if (rate >= 15) return PALETTE.warning;
                return PALETTE.primary;
              }}
            />
            <ul className={demo.funnelRates}>
              {salesFunnel.map((s) => (
                <li key={s.stage}>
                  <span className={demo.funnelStage}>{s.stage}</span>
                  <span className={demo.funnelRate}>{s.rate}%</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.panel} aria-labelledby="demo-acq">
            <div className={styles.panelHead}>
              <div>
                <h3 id="demo-acq" className={styles.panelTitle}>
                  Customer acquisition
                </h3>
                <p className={styles.panelSub}>Share of new customers by channel</p>
              </div>
            </div>
            <DonutChart
              data={acquisition}
              nameKey="channel"
              valueKey="value"
              height={220}
              centerValue="100%"
              centerLabel="of new customers"
            />
            <ChartLegend
              items={acquisition.map((a) => ({
                label: a.channel,
                value: `${a.value}%`,
                color: a.color,
              }))}
            />
          </section>
        </div>

        {/* products + alerts */}
        <div className={styles.gridWide}>
          <section className={styles.panel} aria-labelledby="demo-products">
            <div className={styles.panelHead}>
              <div>
                <h3 id="demo-products" className={styles.panelTitle}>
                  Top products &amp; services
                </h3>
                <p className={styles.panelSub}>Ranked by revenue contribution this period</p>
              </div>
            </div>
            <ol className={styles.ranked}>
              {topProducts.map((p, i) => (
                <li key={p.name} className={styles.rankItem}>
                  <span className={styles.rankNum}>{i + 1}</span>
                  <div className={styles.rankBody}>
                    <span className={styles.rankName}>{p.name}</span>
                    <div className={styles.rankBar}>
                      <div
                        className={styles.rankFill}
                        style={{ width: `${(p.revenue / maxProductRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className={styles.rankValue}>{KES(p.revenue, true)}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.panel} aria-labelledby="demo-alerts" ref={alertsRef}>
            <div className={styles.panelHead}>
              <div>
                <h3 id="demo-alerts" className={styles.panelTitle}>
                  <Bell size={15} aria-hidden="true" style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />
                  Alerts
                </h3>
                <p className={styles.panelSub}>Live business alerts, colour-coded by severity</p>
              </div>
            </div>
            <div className={styles.alertList}>
              {alerts.slice(0, 3).map((a, i) => (
                <article
                  key={a.id}
                  className={`${styles.alertItem} dp-slide-right`}
                  data-sev={a.severity}
                  data-visible={alertsVisible}
                  style={{ ["--dp-reveal-delay" as string]: `${i * 80}ms` }}
                >
                  <span className={styles.alertIcon}>
                    {a.severity === "info" ? (
                      <Info size={17} aria-hidden="true" />
                    ) : (
                      <AlertTriangle size={17} aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <h4 className={styles.alertTitle}>{a.title}</h4>
                    <p className={styles.alertDetail}>{a.detail}</p>
                    <p className={styles.alertMeta}>
                      <span>{a.time}</span>
                      <span>·</span>
                      <span>Delivered via {a.channel}</span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      <footer className={demo.footer}>
        <p className={demo.footerNote}>
          All figures on this page are generated sample data for a fictional Nairobi retail and
          services group. Connect your own M-Pesa till, Google Sheet or POS export to see your
          real numbers in the same layout.
        </p>
        <Link href="/signup" className={demo.footerCta}>
          Start your free trial
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </footer>
    </div>
  );
}
