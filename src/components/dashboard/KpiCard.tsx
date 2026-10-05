"use client";

import { ArrowDownRight, ArrowUpRight, Banknote, Receipt, ShoppingBag, Users } from "lucide-react";
import { Sparkline, PALETTE } from "@/components/charts";
import { useCountUp } from "@/lib/hooks";
import type { Kpi } from "@/data/analytics";
import styles from "./dashboard.module.css";

/**
 * KPI card.
 * Modelled on MiniStatisticsCard from the design source zip — current value,
 * percentage change vs previous period, gradient icon tile — extended per the
 * brief with an in-card sparkline and an 800ms count-up on load.
 */

const ICONS = {
  revenue: Banknote,
  customers: Users,
  orders: ShoppingBag,
  aov: Receipt,
} as const;

const GRADIENTS = {
  revenue: "var(--dp-grad-info)",
  customers: "var(--dp-grad-primary)",
  orders: "var(--dp-grad-success)",
  aov: "var(--dp-grad-dark)",
} as const;

const SPARK_COLOR = {
  revenue: PALETTE.info,
  customers: PALETTE.primary,
  orders: PALETTE.success,
  aov: PALETTE.dark,
} as const;

export default function KpiCard({ kpi, previousLabel }: { kpi: Kpi; previousLabel: string }) {
  // Brief: KPI cards count up on dashboard load, 800ms.
  const animated = useCountUp(kpi.value, 800);
  const Cmp = ICONS[kpi.icon];
  const positive = kpi.change >= 0;

  const display = `${kpi.prefix ?? ""}${Intl.NumberFormat("en-KE", {
    maximumFractionDigits: 0,
  }).format(Math.round(animated))}${kpi.suffix ?? ""}`;

  return (
    <article className={styles.kpi}>
      <div className={styles.kpiTop}>
        <div>
          <p className={styles.kpiLabel}>{kpi.label}</p>
          <p className={styles.kpiValue}>{display}</p>
        </div>
        <span className={styles.kpiIcon} style={{ background: GRADIENTS[kpi.icon] }}>
          <Cmp size={19} aria-hidden="true" />
        </span>
      </div>

      <p className={styles.kpiChange} data-positive={positive}>
        {positive ? <ArrowUpRight size={13} aria-hidden="true" /> : <ArrowDownRight size={13} aria-hidden="true" />}
        {positive ? "+" : ""}
        {kpi.change.toFixed(1)}%
        <span className={styles.kpiChangeNote}>vs {previousLabel}</span>
      </p>

      <div className={styles.kpiSpark}>
        <Sparkline values={kpi.spark} color={SPARK_COLOR[kpi.icon]} height={38} />
      </div>
    </article>
  );
}
