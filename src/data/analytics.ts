/**
 * DataPulse sample analytics dataset.
 *
 * Deterministic, seeded dummy data modelled on a mid-sized Nairobi retail +
 * services business. Used by the public /demo page and as the fallback dataset
 * for the authenticated dashboard when no integration (M-Pesa Daraja / Google
 * Sheets) is connected.
 *
 * Colocated data module, mirroring the zip's `layouts/**\/data/*.js` convention.
 * All currency values are KES.
 */

export type RangeKey = "7d" | "30d" | "90d" | "custom";

/* Deterministic pseudo-random so SSR and client agree (no hydration drift). */
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const KES = (n: number, compact = false) =>
  compact
    ? `KES ${Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 }).format(n)}`
    : `KES ${Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(n)}`;

export const NUM = (n: number) => Intl.NumberFormat("en-KE").format(n);

/* ------------------------------------------------------------------ */
/* Revenue series                                                      */
/* ------------------------------------------------------------------ */

export interface DayPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
  customers: number;
}

const DAY_MS = 86_400_000;
/** Fixed anchor so server and client render identical labels. */
const ANCHOR = Date.UTC(2026, 9, 5); // 2026-10-05

export function buildDailySeries(days: number): DayPoint[] {
  const rand = seeded(days * 97 + 13);
  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(ANCHOR - i * DAY_MS);
    const dow = d.getUTCDay();
    // Nairobi retail rhythm: Fri/Sat peak, Sunday trough.
    const weekday = dow === 0 ? 0.62 : dow === 6 ? 1.34 : dow === 5 ? 1.22 : 1;
    // Month-end salary bump (Kenyan pay cycle).
    const dom = d.getUTCDate();
    const payday = dom >= 27 || dom <= 3 ? 1.21 : 1;
    const trend = 1 + (days - i) / (days * 7);
    const noise = 0.86 + rand() * 0.3;
    const revenue = Math.round(58_000 * weekday * payday * trend * noise);
    out.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-KE", { day: "numeric", month: "short", timeZone: "UTC" }),
      revenue,
      orders: Math.round(revenue / (2_650 + rand() * 500)),
      customers: Math.round(revenue / (9_400 + rand() * 1800)),
    });
  }
  return out;
}

export const RANGE_DAYS: Record<RangeKey, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  custom: 45,
};

export const RANGE_LABEL: Record<RangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  custom: "Custom range",
};

export function monthlySeries() {
  return [
    { label: "Nov", revenue: 1_284_000, target: 1_200_000, lastYear: 1_010_000 },
    { label: "Dec", revenue: 1_902_000, target: 1_700_000, lastYear: 1_488_000 },
    { label: "Jan", revenue: 1_146_000, target: 1_250_000, lastYear: 982_000 },
    { label: "Feb", revenue: 1_318_000, target: 1_300_000, lastYear: 1_104_000 },
    { label: "Mar", revenue: 1_472_000, target: 1_350_000, lastYear: 1_221_000 },
    { label: "Apr", revenue: 1_388_000, target: 1_400_000, lastYear: 1_190_000 },
    { label: "May", revenue: 1_604_000, target: 1_450_000, lastYear: 1_302_000 },
    { label: "Jun", revenue: 1_721_000, target: 1_500_000, lastYear: 1_366_000 },
    { label: "Jul", revenue: 1_669_000, target: 1_550_000, lastYear: 1_401_000 },
    { label: "Aug", revenue: 1_845_000, target: 1_600_000, lastYear: 1_477_000 },
    { label: "Sep", revenue: 1_958_000, target: 1_700_000, lastYear: 1_540_000 },
    { label: "Oct", revenue: 2_114_000, target: 1_800_000, lastYear: 1_612_000 },
  ];
}

export function weeklySeries() {
  return [
    { label: "W1", revenue: 412_000 },
    { label: "W2", revenue: 468_000 },
    { label: "W3", revenue: 503_000 },
    { label: "W4", revenue: 489_000 },
    { label: "W5", revenue: 541_000 },
    { label: "W6", revenue: 522_000 },
    { label: "W7", revenue: 588_000 },
    { label: "W8", revenue: 617_000 },
  ];
}

/* ------------------------------------------------------------------ */
/* KPIs                                                                */
/* ------------------------------------------------------------------ */

export interface Kpi {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: number;
  spark: number[];
  icon: "revenue" | "customers" | "orders" | "aov";
}

export function kpis(range: RangeKey): Kpi[] {
  const series = buildDailySeries(RANGE_DAYS[range]);
  const revenue = series.reduce((a, b) => a + b.revenue, 0);
  const orders = series.reduce((a, b) => a + b.orders, 0);
  const customers = series.reduce((a, b) => a + b.customers, 0);
  const spark = (key: keyof DayPoint) =>
    series.slice(-12).map((d) => Number(d[key])) as number[];

  return [
    {
      id: "revenue",
      label: "Total Revenue",
      value: revenue,
      prefix: "KES ",
      change: 12.4,
      spark: spark("revenue"),
      icon: "revenue",
    },
    {
      id: "customers",
      label: "New Customers",
      value: customers,
      change: 8.1,
      spark: spark("customers"),
      icon: "customers",
    },
    {
      id: "orders",
      label: "Orders Completed",
      value: orders,
      change: 5.6,
      spark: spark("orders"),
      icon: "orders",
    },
    {
      id: "aov",
      label: "Avg Order Value",
      value: Math.round(revenue / Math.max(orders, 1)),
      prefix: "KES ",
      change: -2.3,
      spark: spark("revenue").map((v, i) => Math.round(v / (spark("orders")[i] || 1))),
      icon: "aov",
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Sales funnel                                                        */
/* ------------------------------------------------------------------ */

export const salesFunnel = [
  { stage: "Leads captured", count: 4_820, rate: 100 },
  { stage: "Qualified", count: 2_914, rate: 60.5 },
  { stage: "Quotation sent", count: 1_658, rate: 34.4 },
  { stage: "Negotiation", count: 904, rate: 18.8 },
  { stage: "Closed won", count: 517, rate: 10.7 },
];

/* ------------------------------------------------------------------ */
/* Products / services                                                 */
/* ------------------------------------------------------------------ */

export interface Product {
  name: string;
  revenue: number;
  units: number;
  stock: number;
  reorderPoint: number;
  velocity: number;
  supplier: string;
  leadTimeDays: number;
}

export const products: Product[] = [
  {
    name: "Unga wa Ngano 2kg",
    revenue: 684_000,
    units: 4_240,
    stock: 182,
    reorderPoint: 250,
    velocity: 41,
    supplier: "Nakuru Millers Ltd",
    leadTimeDays: 5,
  },
  {
    name: "Cooking Oil 5L",
    revenue: 612_500,
    units: 1_225,
    stock: 96,
    reorderPoint: 140,
    velocity: 18,
    supplier: "Bidco Africa",
    leadTimeDays: 7,
  },
  {
    name: "Solar Lantern Kit",
    revenue: 548_000,
    units: 274,
    stock: 41,
    reorderPoint: 60,
    velocity: 7,
    supplier: "M-KOPA Distributors",
    leadTimeDays: 12,
  },
  {
    name: "Airtime & Data Bundles",
    revenue: 497_200,
    units: 9_944,
    stock: 9999,
    reorderPoint: 0,
    velocity: 320,
    supplier: "Safaricom Dealer",
    leadTimeDays: 0,
  },
  {
    name: "Maize Flour 10kg",
    revenue: 433_800,
    units: 723,
    stock: 318,
    reorderPoint: 200,
    velocity: 24,
    supplier: "Nakuru Millers Ltd",
    leadTimeDays: 5,
  },
  {
    name: "Bottled Water 20L",
    revenue: 318_400,
    units: 1_592,
    stock: 64,
    reorderPoint: 120,
    velocity: 29,
    supplier: "Aquamist Kenya",
    leadTimeDays: 3,
  },
  {
    name: "Detergent 1L",
    revenue: 276_900,
    units: 1_845,
    stock: 412,
    reorderPoint: 180,
    velocity: 22,
    supplier: "Kapa Oil Refineries",
    leadTimeDays: 6,
  },
  {
    name: "LPG Refill 6kg",
    revenue: 254_100,
    units: 231,
    stock: 28,
    reorderPoint: 45,
    velocity: 6,
    supplier: "Pro Gas Nairobi",
    leadTimeDays: 4,
  },
];

/* ------------------------------------------------------------------ */
/* Customer acquisition                                                */
/* ------------------------------------------------------------------ */

export const acquisition = [
  { channel: "Walk-in / Shop", value: 34, color: "#17c1e8" },
  { channel: "WhatsApp Business", value: 27, color: "#cb0c9f" },
  { channel: "Facebook & Instagram", value: 18, color: "#82d616" },
  { channel: "Referral", value: 13, color: "#fbcf33" },
  { channel: "Google Search", value: 8, color: "#344767" },
];

export const newVsReturning = [
  { label: "Jun", newCustomers: 184, returning: 412 },
  { label: "Jul", newCustomers: 211, returning: 438 },
  { label: "Aug", newCustomers: 196, returning: 471 },
  { label: "Sep", newCustomers: 243, returning: 504 },
  { label: "Oct", newCustomers: 268, returning: 548 },
];

export const clvDistribution = [
  { band: "0–10K", customers: 412 },
  { band: "10–25K", customers: 318 },
  { band: "25–50K", customers: 204 },
  { band: "50–100K", customers: 118 },
  { band: "100–250K", customers: 54 },
  { band: "250K+", customers: 19 },
];

export interface CustomerGeo {
  area: string;
  county: string;
  customers: number;
  revenue: number;
  lat: number;
  lng: number;
}

export const customerGeo: CustomerGeo[] = [
  { area: "Westlands", county: "Nairobi", customers: 214, revenue: 1_284_000, lat: -1.2676, lng: 36.8108 },
  { area: "Kasarani", county: "Nairobi", customers: 188, revenue: 742_000, lat: -1.2203, lng: 36.8961 },
  { area: "Embakasi South", county: "Nairobi", customers: 167, revenue: 688_000, lat: -1.3209, lng: 36.8964 },
  { area: "Kilimani", county: "Nairobi", customers: 142, revenue: 1_102_000, lat: -1.2921, lng: 36.7845 },
  { area: "Dagoretti North", county: "Nairobi", customers: 131, revenue: 521_000, lat: -1.2887, lng: 36.7489 },
  { area: "Ruiru", county: "Kiambu", customers: 118, revenue: 497_000, lat: -1.1456, lng: 36.9625 },
  { area: "Nyali", county: "Mombasa", customers: 96, revenue: 612_000, lat: -4.0435, lng: 39.7, },
  { area: "Nakuru Town East", county: "Nakuru", customers: 84, revenue: 384_000, lat: -0.3031, lng: 36.08 },
  { area: "Kisumu Central", county: "Kisumu", customers: 71, revenue: 341_000, lat: -0.0917, lng: 34.768 },
  { area: "Eldoret North", county: "Uasin Gishu", customers: 58, revenue: 268_000, lat: 0.5143, lng: 35.2698 },
];

export interface ChurnRisk {
  customer: string;
  segment: string;
  lastOrder: string;
  lifetimeValue: number;
  risk: number;
}

export const churnRisk: ChurnRisk[] = [
  { customer: "Mwangi General Stores", segment: "Wholesale", lastOrder: "68 days ago", lifetimeValue: 412_000, risk: 87 },
  { customer: "Achieng Hardware", segment: "Wholesale", lastOrder: "54 days ago", lifetimeValue: 288_000, risk: 81 },
  { customer: "Riverside Guest House", segment: "Hospitality", lastOrder: "47 days ago", lifetimeValue: 196_000, risk: 74 },
  { customer: "Kibera Youth SACCO", segment: "Institution", lastOrder: "41 days ago", lifetimeValue: 154_000, risk: 68 },
  { customer: "Njeri's Salon & Spa", segment: "Retail", lastOrder: "38 days ago", lifetimeValue: 88_400, risk: 61 },
  { customer: "Thika Road Pharmacy", segment: "Retail", lastOrder: "33 days ago", lifetimeValue: 142_000, risk: 57 },
  { customer: "Green Acres Academy", segment: "Education", lastOrder: "29 days ago", lifetimeValue: 221_000, risk: 52 },
];

/* ------------------------------------------------------------------ */
/* Transactions                                                        */
/* ------------------------------------------------------------------ */

export interface Txn {
  id: string;
  customer: string;
  channel: "M-Pesa" | "Card" | "Cash" | "Bank Transfer";
  amount: number;
  status: "Completed" | "Pending" | "Refunded";
  time: string;
}

export const transactions: Txn[] = [
  { id: "TXN-90412", customer: "Mwangi General Stores", channel: "M-Pesa", amount: 42_800, status: "Completed", time: "08:14" },
  { id: "TXN-90411", customer: "Riverside Guest House", channel: "Bank Transfer", amount: 118_500, status: "Completed", time: "08:02" },
  { id: "TXN-90410", customer: "Wanjiku Retail", channel: "M-Pesa", amount: 6_240, status: "Completed", time: "07:51" },
  { id: "TXN-90409", customer: "Green Acres Academy", channel: "Bank Transfer", amount: 264_000, status: "Pending", time: "07:38" },
  { id: "TXN-90408", customer: "Otieno Electronics", channel: "Card", amount: 31_900, status: "Completed", time: "07:22" },
  { id: "TXN-90407", customer: "Njeri's Salon & Spa", channel: "M-Pesa", amount: 4_150, status: "Completed", time: "07:09" },
  { id: "TXN-90406", customer: "Thika Road Pharmacy", channel: "M-Pesa", amount: 18_720, status: "Refunded", time: "06:55" },
  { id: "TXN-90405", customer: "Kibera Youth SACCO", channel: "Cash", amount: 9_600, status: "Completed", time: "06:41" },
  { id: "TXN-90404", customer: "Achieng Hardware", channel: "M-Pesa", amount: 27_340, status: "Completed", time: "06:28" },
  { id: "TXN-90403", customer: "Coastal Fresh Produce", channel: "M-Pesa", amount: 52_100, status: "Completed", time: "06:12" },
];

/* ------------------------------------------------------------------ */
/* Alerts                                                              */
/* ------------------------------------------------------------------ */

export type Severity = "critical" | "warning" | "info";

export interface BizAlert {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  time: string;
  channel: "WhatsApp" | "Email" | "In-app";
}

export const alerts: BizAlert[] = [
  {
    id: "ALR-301",
    severity: "critical",
    title: "LPG Refill 6kg below reorder point",
    detail: "Stock at 28 units against a reorder point of 45. Predicted stockout in 4 days at the current velocity of 6 units/day.",
    time: "12 min ago",
    channel: "WhatsApp",
  },
  {
    id: "ALR-302",
    severity: "warning",
    title: "Daily revenue dipped below KES 50,000",
    detail: "Tuesday closed at KES 46,180 — 21% under the 30-day weekday average of KES 58,400.",
    time: "1 hr ago",
    channel: "WhatsApp",
  },
  {
    id: "ALR-303",
    severity: "info",
    title: "Westlands branch beat its monthly target",
    detail: "Westlands hit 104% of the October target with 9 days still remaining in the period.",
    time: "3 hrs ago",
    channel: "Email",
  },
  {
    id: "ALR-304",
    severity: "warning",
    title: "2 wholesale customers flagged at-risk",
    detail: "Mwangi General Stores (87%) and Achieng Hardware (81%) crossed the 80% churn-probability threshold.",
    time: "6 hrs ago",
    channel: "Email",
  },
  {
    id: "ALR-305",
    severity: "info",
    title: "M-Pesa Daraja sync completed",
    detail: "1,284 till transactions imported for the period 1–5 October. No reconciliation gaps detected.",
    time: "9 hrs ago",
    channel: "In-app",
  },
];

/* ------------------------------------------------------------------ */
/* Staff                                                               */
/* ------------------------------------------------------------------ */

export interface StaffMember {
  name: string;
  role: string;
  department: string;
  tasks: number;
  attendance: number;
  score: number;
}

export const staff: StaffMember[] = [
  { name: "Grace Wanjiru", role: "Sales Lead", department: "Sales", tasks: 148, attendance: 98, score: 94 },
  { name: "Brian Otieno", role: "Account Manager", department: "Sales", tasks: 132, attendance: 95, score: 89 },
  { name: "Amina Hassan", role: "Store Supervisor", department: "Operations", tasks: 121, attendance: 97, score: 91 },
  { name: "Peter Kamau", role: "Logistics Officer", department: "Operations", tasks: 108, attendance: 92, score: 83 },
  { name: "Faith Chebet", role: "Finance Analyst", department: "Finance", tasks: 96, attendance: 99, score: 92 },
  { name: "Daniel Mutua", role: "Customer Support", department: "Support", tasks: 174, attendance: 90, score: 86 },
  { name: "Esther Njoki", role: "Marketing Associate", department: "Marketing", tasks: 88, attendance: 94, score: 80 },
  { name: "Samuel Kiplagat", role: "Field Sales", department: "Sales", tasks: 112, attendance: 88, score: 78 },
];

export const departmentScores = [
  { department: "Sales", score: 87, headcount: 3 },
  { department: "Operations", score: 87, headcount: 2 },
  { department: "Finance", score: 92, headcount: 1 },
  { department: "Support", score: 86, headcount: 1 },
  { department: "Marketing", score: 80, headcount: 1 },
];

export const salesReps = [
  { name: "Grace Wanjiru", deals: 64, revenue: 1_284_000, winRate: 38 },
  { name: "Brian Otieno", deals: 52, revenue: 982_000, winRate: 33 },
  { name: "Samuel Kiplagat", deals: 41, revenue: 714_000, winRate: 29 },
  { name: "Esther Njoki", deals: 28, revenue: 438_000, winRate: 24 },
];

/* ------------------------------------------------------------------ */
/* Revenue by category + targets                                       */
/* ------------------------------------------------------------------ */

export const revenueByCategory = [
  { category: "Groceries", revenue: 1_718_000 },
  { category: "Household", revenue: 876_000 },
  { category: "Energy & Solar", revenue: 802_000 },
  { category: "Telecoms", revenue: 497_000 },
  { category: "Beverages", revenue: 318_000 },
  { category: "Services", revenue: 241_000 },
];

export const revenueTargets = [
  { label: "Q4 Group Revenue", actual: 4_452_000, target: 5_400_000 },
  { label: "Westlands Branch", actual: 1_284_000, target: 1_230_000 },
  { label: "Wholesale Channel", actual: 1_866_000, target: 2_100_000 },
  { label: "Online & WhatsApp Orders", actual: 712_000, target: 900_000 },
];

/* ------------------------------------------------------------------ */
/* Predictions                                                         */
/* ------------------------------------------------------------------ */

/**
 * Simple ordinary-least-squares linear regression over the daily series.
 * Deliberately simple and explainable — the dashboard surfaces the method
 * verbatim in the "How is this calculated?" panels.
 */
export function linearRegression(values: number[]) {
  const n = values.length;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    num += (i - meanX) * (values[i] - meanY);
    den += (i - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  const residuals = values.map((v, i) => v - (intercept + slope * i));
  const sigma = Math.sqrt(residuals.reduce((a, r) => a + r * r, 0) / Math.max(n - 2, 1));
  return { slope, intercept, sigma, meanY };
}

export interface ForecastPoint {
  label: string;
  actual: number | null;
  forecast: number | null;
  lower: number | null;
  upper: number | null;
}

/** Historical actuals + a dashed forecast extending from the last actual point. */
export function revenueForecast(horizon: 30 | 60 | 90): ForecastPoint[] {
  const history = buildDailySeries(60);
  const values = history.map((d) => d.revenue);
  const { slope, intercept, sigma } = linearRegression(values);
  const n = values.length;

  const out: ForecastPoint[] = history.map((d) => ({
    label: d.label,
    actual: d.revenue,
    forecast: null,
    lower: null,
    upper: null,
  }));

  // Join the dashed line to the final actual point so it visually continues.
  out[out.length - 1].forecast = values[n - 1];
  out[out.length - 1].lower = values[n - 1];
  out[out.length - 1].upper = values[n - 1];

  const step = horizon <= 30 ? 2 : horizon <= 60 ? 4 : 6;
  for (let k = step; k <= horizon; k += step) {
    const i = n - 1 + k;
    const point = intercept + slope * i;
    // Prediction interval widens with the square root of the horizon (1.96σ ≈ 95%).
    const band = 1.96 * sigma * Math.sqrt(1 + k / n);
    const d = new Date(ANCHOR + k * DAY_MS);
    out.push({
      label: d.toLocaleDateString("en-KE", { day: "numeric", month: "short", timeZone: "UTC" }),
      actual: null,
      forecast: Math.round(point),
      lower: Math.round(Math.max(point - band, 0)),
      upper: Math.round(point + band),
    });
  }
  return out;
}

export function forecastSummary(horizon: 30 | 60 | 90) {
  const pts = revenueForecast(horizon).filter((p) => p.actual === null);
  const total = pts.reduce((a, p) => a + (p.forecast ?? 0), 0);
  const perStep = pts.length ? total / pts.length : 0;
  return {
    projected: Math.round(perStep * horizon),
    confidence: horizon === 30 ? 86 : horizon === 60 ? 78 : 71,
  };
}

/**
 * Diagnostics for the OLS revenue model, computed from the same 60-day window
 * the forecast is fitted on. The Predictions tab surfaces these verbatim: the
 * numbers on screen are the numbers this fit produced — nothing is hardcoded.
 */
export function forecastDiagnostics() {
  const history = buildDailySeries(60);
  const values = history.map((d) => d.revenue);
  const n = values.length;
  const { slope, intercept, sigma, meanY } = linearRegression(values);

  let ssRes = 0;
  let ssTot = 0;
  let absPct = 0;
  for (let i = 0; i < n; i += 1) {
    const fitted = intercept + slope * i;
    ssRes += (values[i] - fitted) ** 2;
    ssTot += (values[i] - meanY) ** 2;
    absPct += Math.abs(values[i] - fitted) / Math.max(values[i], 1);
  }

  return {
    windowDays: n,
    slopePerDay: slope,
    monthlyDrift: slope * 30,
    intercept,
    residualSigma: sigma,
    r2: ssTot === 0 ? 0 : 1 - ssRes / ssTot,
    mape: absPct / n,
    meanDailyRevenue: meanY,
  };
}

export interface StockoutPrediction {
  product: string;
  stock: number;
  velocity: number;
  daysToStockout: number;
  recommendedOrder: number;
  leadTimeDays: number;
}

export function stockoutPredictions(): StockoutPrediction[] {
  return products
    .filter((p) => p.reorderPoint > 0)
    .map((p) => {
      const days = Math.max(Math.round(p.stock / Math.max(p.velocity, 1)), 0);
      return {
        product: p.name,
        stock: p.stock,
        velocity: p.velocity,
        daysToStockout: days,
        // Cover the supplier lead time plus a 10-day buffer.
        recommendedOrder: Math.max(
          Math.round(p.velocity * (p.leadTimeDays + 10) - p.stock),
          0
        ),
        leadTimeDays: p.leadTimeDays,
      };
    })
    .sort((a, b) => a.daysToStockout - b.daysToStockout);
}

/** Calendar heatmap of predicted high-sales days for the next month. */
export function salesPeakCalendar() {
  const rand = seeded(2026_10);
  const start = new Date(ANCHOR);
  const cells: { date: string; day: number; dow: number; intensity: number; kes: number }[] = [];
  for (let i = 0; i < 35; i += 1) {
    const d = new Date(ANCHOR + i * DAY_MS);
    const dow = d.getUTCDay();
    const dom = d.getUTCDate();
    const weekday = dow === 0 ? 0.45 : dow === 6 ? 0.95 : dow === 5 ? 0.88 : 0.6;
    const payday = dom >= 27 || dom <= 3 ? 1.0 : 0.72;
    const intensity = Math.min(weekday * payday * (0.88 + rand() * 0.28), 1);
    cells.push({
      date: d.toISOString().slice(0, 10),
      day: dom,
      dow,
      intensity,
      kes: Math.round(42_000 + intensity * 46_000),
    });
  }
  return { start: start.toISOString().slice(0, 10), cells };
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export interface SavedReport {
  id: string;
  name: string;
  metrics: string[];
  frequency: "Daily" | "Weekly" | "Monthly" | "Manual";
  channel: "Email" | "WhatsApp" | "Email + WhatsApp";
  recipients: string;
  lastSent: string;
}

export const savedReports: SavedReport[] = [
  {
    id: "RPT-01",
    name: "Daily Revenue Snapshot",
    metrics: ["Revenue", "Orders", "Avg Order Value"],
    frequency: "Daily",
    channel: "WhatsApp",
    recipients: "+254 112 272 061",
    lastSent: "Today, 07:00",
  },
  {
    id: "RPT-02",
    name: "Weekly Branch Performance",
    metrics: ["Revenue by branch", "Staff score", "Targets"],
    frequency: "Weekly",
    channel: "Email + WhatsApp",
    recipients: "directors@example.co.ke",
    lastSent: "Mon, 06:30",
  },
  {
    id: "RPT-03",
    name: "Monthly Board Pack",
    metrics: ["Revenue", "Forecast", "Churn risk", "Inventory"],
    frequency: "Monthly",
    channel: "Email",
    recipients: "board@example.co.ke",
    lastSent: "1 Oct, 08:00",
  },
  {
    id: "RPT-04",
    name: "Stockout Watchlist",
    metrics: ["Inventory", "Reorder recommendations"],
    frequency: "Weekly",
    channel: "WhatsApp",
    recipients: "+254 112 272 061",
    lastSent: "Fri, 17:00",
  },
];

export const alertRules = [
  {
    id: "RULE-01",
    name: "Daily revenue floor",
    condition: "Daily revenue drops below KES 50,000",
    channel: "WhatsApp + Email",
    active: true,
    triggered: 3,
  },
  {
    id: "RULE-02",
    name: "LPG stock floor",
    condition: "Stock of LPG Refill 6kg falls below 20 units",
    channel: "WhatsApp",
    active: true,
    triggered: 1,
  },
  {
    id: "RULE-03",
    name: "Churn escalation",
    condition: "Any customer churn probability exceeds 80%",
    channel: "Email",
    active: true,
    triggered: 2,
  },
  {
    id: "RULE-04",
    name: "Target overachievement",
    condition: "Branch exceeds 100% of monthly target",
    channel: "In-app",
    active: false,
    triggered: 0,
  },
];

export const alertHistory = [
  { id: "LOG-1181", rule: "Daily revenue floor", firedAt: "5 Oct 2026, 21:05", channel: "WhatsApp", status: "Delivered" },
  { id: "LOG-1180", rule: "LPG stock floor", firedAt: "5 Oct 2026, 14:22", channel: "WhatsApp", status: "Delivered" },
  { id: "LOG-1179", rule: "Churn escalation", firedAt: "4 Oct 2026, 09:40", channel: "Email", status: "Delivered" },
  { id: "LOG-1178", rule: "Daily revenue floor", firedAt: "2 Oct 2026, 21:05", channel: "WhatsApp", status: "Delivered" },
  { id: "LOG-1177", rule: "Churn escalation", firedAt: "1 Oct 2026, 11:18", channel: "Email", status: "Retried" },
];

/* ------------------------------------------------------------------ */
/* Team & settings                                                     */
/* ------------------------------------------------------------------ */

export type Role = "Owner" | "Manager" | "Analyst" | "Viewer";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Invited";
  lastActive: string;
}

export const team: TeamMember[] = [
  { id: "U-01", name: "Benjamin Wambete", email: "owner@datapulse.co.ke", role: "Owner", status: "Active", lastActive: "Now" },
  { id: "U-02", name: "Grace Wanjiru", email: "grace@datapulse.co.ke", role: "Manager", status: "Active", lastActive: "14 min ago" },
  { id: "U-03", name: "Faith Chebet", email: "faith@datapulse.co.ke", role: "Analyst", status: "Active", lastActive: "2 hrs ago" },
  { id: "U-04", name: "Daniel Mutua", email: "daniel@datapulse.co.ke", role: "Viewer", status: "Active", lastActive: "Yesterday" },
  { id: "U-05", name: "Amina Hassan", email: "amina@datapulse.co.ke", role: "Analyst", status: "Invited", lastActive: "—" },
];

export const ROLE_CAPABILITIES: Record<Role, string[]> = {
  Owner: [
    "Full access to every tab and setting",
    "Manage billing and subscription",
    "Invite, promote and remove team members",
    "Connect and disconnect integrations",
  ],
  Manager: [
    "All dashboard tabs",
    "Create and schedule reports",
    "Create and edit alert rules",
    "Cannot manage billing or team roles",
  ],
  Analyst: [
    "All dashboard tabs",
    "Build and export reports",
    "Read-only on alert rules",
    "Cannot manage team or integrations",
  ],
  Viewer: [
    "Overview, Revenue and Reports tabs",
    "Download shared reports",
    "No edit rights anywhere",
  ],
};

/** Tabs each role may open. Enforced in middleware, API routes and the UI. */
export const ROLE_TABS: Record<Role, string[]> = {
  Owner: [
    "overview", "revenue", "sales", "customers", "inventory",
    "staff", "reports", "predictions", "alerts", "settings",
  ],
  Manager: [
    "overview", "revenue", "sales", "customers", "inventory",
    "staff", "reports", "predictions", "alerts",
  ],
  Analyst: ["overview", "revenue", "sales", "customers", "inventory", "reports", "predictions"],
  Viewer: ["overview", "revenue", "reports"],
};
