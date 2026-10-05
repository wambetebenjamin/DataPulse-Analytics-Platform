"use client";

/**
 * Recharts chart set.
 *
 * The design source zip used Chart.js 3.9.1 + react-chartjs-2 3.0.5; the brief
 * mandates Recharts (DESIGN-SOURCE-AUDIT.md §13, §16). The *grammar* of the
 * source charts is reproduced exactly:
 *
 *   - legend hidden by default
 *   - tooltip in index mode, no intersect
 *   - y grid: dashed [5,5], no border, no ticks drawn
 *   - x grid: hidden entirely
 *   - tick colour #b2b9bf, font-size 11, family Roboto
 *   - responsive container, maintainAspectRatio false
 *   - gradient area fill from gradientChartLine(): createLinearGradient(0,230,0,50)
 *     with stops rgba(color,.2) -> transparent
 */

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePrefersReducedMotion } from "@/lib/hooks";
import styles from "./charts.module.css";

export const CHART_TICK = "#b2b9bf";
export const AXIS_FONT = 11;

/**
 * Chart rows. Recharts is structurally permissive about its data shape, and the
 * app feeds it plain interfaces (DayPoint, Product, …) which TypeScript will not
 * widen to Record<string, unknown> without an index signature. A deliberately
 * loose alias keeps call sites clean without weakening anything that matters.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ChartDatum = Record<string, any>;

const tickStyle = { fill: CHART_TICK, fontSize: AXIS_FONT, fontFamily: "var(--dp-font-family)" };

export const PALETTE = {
  info: "#17c1e8",
  infoDeep: "#2152ff",
  infoLight: "#21d4fd",
  primary: "#cb0c9f",
  success: "#82d616",
  warning: "#fbcf33",
  error: "#ea0606",
  dark: "#344767",
  secondary: "#8392ab",
};

export const SERIES_COLORS = [
  PALETTE.info,
  PALETTE.primary,
  PALETTE.success,
  PALETTE.warning,
  PALETTE.dark,
  PALETTE.secondary,
];

/* ------------------------------------------------------------------ */
/* Shared tooltip                                                      */
/* ------------------------------------------------------------------ */

interface TooltipPayload {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

export function SoftTooltip({
  active,
  payload,
  label,
  formatter,
  labelSuffix,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
  formatter?: (v: number) => string;
  labelSuffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      {label !== undefined && (
        <p className={styles.tooltipLabel}>
          {label}
          {labelSuffix}
        </p>
      )}
      {payload
        .filter((p) => p.value !== null && p.value !== undefined)
        .map((p, i) => (
          <p key={i} className={styles.tooltipRow}>
            <span className={styles.tooltipDot} style={{ background: p.color }} aria-hidden="true" />
            <span className={styles.tooltipName}>{p.name}</span>
            <span className={styles.tooltipValue}>
              {typeof p.value === "number" && formatter
                ? formatter(p.value)
                : Intl.NumberFormat("en-KE").format(Number(p.value))}
            </span>
          </p>
        ))}
    </div>
  );
}

const kesFmt = (v: number) => `KES ${Intl.NumberFormat("en-KE").format(Math.round(v))}`;
const compactAxis = (v: number) =>
  Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 }).format(v);

/* ------------------------------------------------------------------ */
/* Gradient area line chart — the source's signature GradientLineChart */
/* ------------------------------------------------------------------ */

export interface SeriesDef {
  key: string;
  name: string;
  color: string;
}

export function GradientLineChart({
  data,
  xKey = "label",
  series,
  height = 300,
  currency = true,
  showLegend = false,
  animate = true,
}: {
  data: ChartDatum[];
  xKey?: string;
  series: SeriesDef[];
  height?: number;
  currency?: boolean;
  showLegend?: boolean;
  animate?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const reduced = usePrefersReducedMotion();
  const isAnimated = animate && !reduced;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                {/* gradientChartLine(): rgba(color, .2) at the top, transparent at the base */}
                <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                <stop offset="80%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {/* y grid dashed [5,5], x grid hidden (source config) */}
          <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#e9ecef" />
          <XAxis
            dataKey={xKey}
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            tickMargin={16}
            minTickGap={18}
          />
          <YAxis
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={52}
            tickFormatter={compactAxis}
          />
          <Tooltip
            cursor={{ stroke: "#dee2e6", strokeWidth: 1 }}
            content={<SoftTooltip formatter={currency ? kesFmt : undefined} />}
          />
          {showLegend && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />}

          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={3}
              fill={`url(#grad-${uid}-${s.key})`}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
              isAnimationActive={isAnimated}
              animationDuration={900}
              animationEasing="ease-out"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vertical bar chart                                                  */
/* ------------------------------------------------------------------ */

export function VerticalBarChart({
  data,
  xKey,
  barKey,
  color = PALETTE.info,
  height = 300,
  currency = true,
}: {
  data: ChartDatum[];
  xKey: string;
  barKey: string;
  color?: string;
  height?: number;
  currency?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#e9ecef" />
          <XAxis
            dataKey={xKey}
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            tickMargin={14}
            interval={0}
            angle={data.length > 6 ? -18 : 0}
            textAnchor={data.length > 6 ? "end" : "middle"}
            height={data.length > 6 ? 56 : 36}
          />
          <YAxis
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={compactAxis}
          />
          <Tooltip
            cursor={{ fill: "rgba(23,193,232,0.06)" }}
            content={<SoftTooltip formatter={currency ? kesFmt : undefined} />}
          />
          <Bar
            dataKey={barKey}
            name={barKey}
            fill={color}
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
            isAnimationActive={!reduced}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Horizontal bar chart — sales funnel, stock levels                   */
/* ------------------------------------------------------------------ */

export function HorizontalBarChart({
  data,
  yKey,
  barKey,
  color = PALETTE.info,
  height = 320,
  currency = false,
  colorByValue,
  yWidth = 150,
}: {
  data: ChartDatum[];
  yKey: string;
  barKey: string;
  color?: string;
  height?: number;
  currency?: boolean;
  colorByValue?: (row: ChartDatum) => string;
  yWidth?: number;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 20, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="5 5" horizontal={false} stroke="#e9ecef" />
          <XAxis
            type="number"
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            tickFormatter={compactAxis}
          />
          <YAxis
            type="category"
            dataKey={yKey}
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            width={yWidth}
          />
          <Tooltip
            cursor={{ fill: "rgba(23,193,232,0.06)" }}
            content={<SoftTooltip formatter={currency ? kesFmt : undefined} />}
          />
          <Bar
            dataKey={barKey}
            name={barKey}
            radius={[0, 6, 6, 0]}
            maxBarSize={30}
            isAnimationActive={!reduced}
            animationDuration={800}
          >
            {data.map((row, i) => (
              <Cell key={i} fill={colorByValue ? colorByValue(row) : color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donut chart                                                         */
/* ------------------------------------------------------------------ */

export function DonutChart({
  data,
  nameKey = "channel",
  valueKey = "value",
  height = 280,
  centerLabel,
  centerValue,
  suffix = "%",
}: {
  data: { [k: string]: unknown; color?: string }[];
  nameKey?: string;
  valueKey?: string;
  height?: number;
  centerLabel?: string;
  centerValue?: string;
  suffix?: string;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className={styles.donutWrap} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            innerRadius="62%"
            outerRadius="92%"
            paddingAngle={2}
            stroke="none"
            isAnimationActive={!reduced}
            animationDuration={800}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={(d.color as string) ?? SERIES_COLORS[i % SERIES_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<SoftTooltip formatter={(v) => `${v}${suffix}`} />} />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className={styles.donutCenter} aria-hidden="true">
          {centerValue && <span className={styles.donutValue}>{centerValue}</span>}
          {centerLabel && <span className={styles.donutLabel}>{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

/** Accessible legend rendered outside the SVG so it is readable at 11px+. */
export function ChartLegend({
  items,
}: {
  items: { label: string; value?: string; color: string }[];
}) {
  return (
    <ul className={styles.legend}>
      {items.map((item) => (
        <li key={item.label} className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: item.color }} aria-hidden="true" />
          <span className={styles.legendLabel}>{item.label}</span>
          {item.value && <span className={styles.legendValue}>{item.value}</span>}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Forecast chart — actual line + dashed projection + confidence band  */
/* ------------------------------------------------------------------ */

export function ForecastChart({
  data,
  height = 360,
}: {
  data: {
    label: string;
    actual: number | null;
    forecast: number | null;
    lower: number | null;
    upper: number | null;
  }[];
  height?: number;
}) {
  const reduced = usePrefersReducedMotion();
  // Recharts stacks areas, so plot the band as [lower, upper-lower].
  const banded = data.map((d) => ({
    ...d,
    bandBase: d.lower,
    bandSpan: d.lower !== null && d.upper !== null ? d.upper - d.lower : null,
  }));

  const splitIndex = data.findIndex((d) => d.actual === null);
  const splitLabel = splitIndex > 0 ? data[splitIndex - 1].label : undefined;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={banded} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="dp-actual-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.info} stopOpacity={0.25} />
              <stop offset="85%" stopColor={PALETTE.info} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#e9ecef" />
          <XAxis
            dataKey="label"
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            tickMargin={16}
            minTickGap={24}
          />
          <YAxis
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            width={54}
            tickFormatter={compactAxis}
          />
          <Tooltip content={<SoftTooltip formatter={kesFmt} />} />

          {/* 95% confidence band — visible at every breakpoint (brief) */}
          <Area
            dataKey="bandBase"
            stackId="band"
            stroke="none"
            fill="transparent"
            name="　"
            isAnimationActive={false}
            legendType="none"
          />
          <Area
            dataKey="bandSpan"
            stackId="band"
            stroke="none"
            fill={PALETTE.primary}
            fillOpacity={0.14}
            name="95% confidence range"
            isAnimationActive={!reduced}
            animationDuration={900}
          />

          {/* historical actuals */}
          <Area
            type="monotone"
            dataKey="actual"
            name="Actual revenue"
            stroke={PALETTE.info}
            strokeWidth={3}
            fill="url(#dp-actual-fill)"
            dot={false}
            connectNulls={false}
            isAnimationActive={!reduced}
            animationDuration={900}
          />

          {/* dashed forecast extending rightward from the last actual point */}
          <Line
            type="monotone"
            dataKey="forecast"
            name="Forecast (estimate)"
            stroke={PALETTE.primary}
            strokeWidth={3}
            strokeDasharray="7 6"
            dot={false}
            connectNulls
            className={reduced ? undefined : styles.forecastLine}
            isAnimationActive={!reduced}
            animationDuration={1000}
            animationEasing="ease-out"
          />

          {splitLabel && (
            <ReferenceLine
              x={splitLabel}
              stroke={PALETTE.secondary}
              strokeDasharray="3 4"
              label={{
                value: "Today",
                position: "insideTopRight",
                fill: CHART_TICK,
                fontSize: 11,
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Grouped bar — new vs returning, department comparison               */
/* ------------------------------------------------------------------ */

export function GroupedBarChart({
  data,
  xKey,
  series,
  height = 300,
  currency = false,
}: {
  data: ChartDatum[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  currency?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#e9ecef" />
          <XAxis dataKey={xKey} tick={tickStyle} tickLine={false} axisLine={false} tickMargin={14} />
          <YAxis
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={compactAxis}
          />
          <Tooltip
            cursor={{ fill: "rgba(23,193,232,0.06)" }}
            content={<SoftTooltip formatter={currency ? kesFmt : undefined} />}
          />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color}
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
              isAnimationActive={!reduced}
              animationDuration={800}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sparkline — inside KPI cards                                        */
/* ------------------------------------------------------------------ */

export function Sparkline({
  values,
  color = PALETTE.info,
  height = 40,
}: {
  values: number[];
  color?: string;
  height?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div style={{ width: "100%", height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${uid})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
