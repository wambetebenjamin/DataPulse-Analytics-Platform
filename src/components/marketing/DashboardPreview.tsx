"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Bell, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer } from "recharts";
import { usePrefersReducedMotion } from "@/lib/hooks";
import styles from "./dashboard-preview.module.css";

/**
 * Animated live dashboard preview inside a styled browser frame.
 *
 * Brief: "Charts inside the preview update with dummy data every 3 seconds
 * suggesting live data. Built using Recharts inside a styled browser frame.
 * Subtle floating animation on the preview frame."
 */

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CATEGORIES = ["Groceries", "Energy", "Telecom", "Household", "Services"];

/* Deterministic first frame so SSR and the client hydrate identically. */
const SEED_LINE = [52, 61, 48, 74, 69, 88, 79, 96, 104];
const SEED_BARS = [72, 48, 91, 63, 55];

function jitter(base: number[], amount: number) {
  return base.map((v) => Math.max(12, Math.round(v + (Math.random() - 0.5) * amount)));
}

export default function DashboardPreview() {
  const reduced = usePrefersReducedMotion();
  const [line, setLine] = useState(SEED_LINE);
  const [bars, setBars] = useState(SEED_BARS);
  const [revenue, setRevenue] = useState(2_114_000);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduced) return;
    // Brief: dummy data updates every 3 seconds with a smooth transition.
    const id = window.setInterval(() => {
      setLine((prev) => jitter(prev, 16).map((v, i) => Math.round(v * 0.82 + SEED_LINE[i] * 0.18)));
      setBars((prev) => jitter(prev, 22).map((v, i) => Math.round(v * 0.8 + SEED_BARS[i] * 0.2)));
      setRevenue((r) => {
        const next = r + Math.round((Math.random() - 0.42) * 38_000);
        return Math.min(Math.max(next, 1_840_000), 2_460_000);
      });
      setTick((t) => t + 1);
    }, 3000);
    return () => window.clearInterval(id);
  }, [reduced]);

  const lineData = useMemo(() => line.map((v, i) => ({ label: MONTHS[i], v })), [line]);
  const barData = useMemo(() => bars.map((v, i) => ({ label: CATEGORIES[i], v })), [bars]);
  const delta = useMemo(() => 8.4 + ((tick * 1.7) % 5) - 2, [tick]);

  return (
    <div className={styles.float}>
      <div className={styles.frame} role="img" aria-label="Preview of the DataPulse analytics dashboard showing live revenue, trend and category charts">
        {/* browser chrome */}
        <div className={styles.chrome}>
          <span className={styles.dots} aria-hidden="true">
            <i /> <i /> <i />
          </span>
          <span className={styles.url}>
            <span className={styles.lock} aria-hidden="true" />
            app.datapulse.co.ke/dashboard
          </span>
          <span className={styles.liveTag}>
            <span className={styles.liveDot} aria-hidden="true" />
            Live
          </span>
        </div>

        <div className={styles.body}>
          {/* KPI strip */}
          <div className={styles.kpiRow}>
            <div className={styles.kpiMain}>
              <span className={styles.kpiLabel}>Total Revenue — October</span>
              <span className={styles.kpiValue} key={revenue}>
                KES {Intl.NumberFormat("en-KE").format(revenue)}
              </span>
              <span className={styles.kpiDelta} data-positive={delta >= 0}>
                {delta >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {Math.abs(delta).toFixed(1)}% vs September
              </span>
            </div>
            <div className={styles.kpiSide}>
              <div className={styles.miniStat}>
                <span className={styles.miniLabel}>Orders</span>
                <span className={styles.miniValue}>{780 + (tick % 7) * 3}</span>
              </div>
              <div className={styles.miniStat}>
                <span className={styles.miniLabel}>New customers</span>
                <span className={styles.miniValue}>{214 + (tick % 5) * 2}</span>
              </div>
            </div>
          </div>

          {/* main trend chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHead}>
              <span className={styles.chartTitle}>Revenue trend</span>
              <span className={styles.chartBadge}>
                <TrendingUp size={11} aria-hidden="true" /> Forecast on
              </span>
            </div>
            <div className={styles.chartBody}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dp-preview-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#17c1e8" stopOpacity={0.34} />
                      <stop offset="100%" stopColor="#17c1e8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#17c1e8"
                    strokeWidth={2.5}
                    fill="url(#dp-preview-grad)"
                    dot={false}
                    isAnimationActive={!reduced}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.axis} aria-hidden="true">
              {MONTHS.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          {/* bottom row */}
          <div className={styles.bottomRow}>
            <div className={styles.chartCard}>
              <span className={styles.chartTitle}>By category</span>
              <div className={styles.barBody}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                    <Bar
                      dataKey="v"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={18}
                      isAnimationActive={!reduced}
                      animationDuration={800}
                    >
                      {barData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={["#17c1e8", "#cb0c9f", "#82d616", "#fbcf33", "#344767"][i]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.alertCard}>
              <span className={styles.chartTitle}>
                <Bell size={12} aria-hidden="true" /> Alerts
              </span>
              <ul className={styles.alertList}>
                <li data-sev="critical">
                  <span className={styles.alertDot} aria-hidden="true" />
                  LPG stock below reorder point
                </li>
                <li data-sev="warning">
                  <span className={styles.alertDot} aria-hidden="true" />
                  Revenue dipped under KES 50,000
                </li>
                <li data-sev="info">
                  <span className={styles.alertDot} aria-hidden="true" />
                  Westlands beat its target
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
