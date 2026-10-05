/** Site-wide configuration, marketing copy and structured content. */

export const SITE = {
  name: "DataPulse Analytics",
  legalName: "DataPulse Analytics Ltd",
  tagline: "Turn Your Business Data Into Decisions.",
  description:
    "Real-time analytics, predictive insights, and custom dashboards for East African businesses.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://datapulse-analytics.co.ke",
  locale: "en_KE",
  city: "Nairobi",
  country: "Kenya",
  address: "Chania Avenue, Kilimani, Nairobi, Kenya",
  email: "hello@datapulse.co.ke",
  dpoEmail: "dpo@datapulse.co.ke",
  supportEmail: "support@datapulse.co.ke",
  phoneDisplay: "+254 112 272 061",
  phone: "254112272061",
  whatsappMessage:
    "Hello! I am interested in DataPulse Analytics for my business.",
  statusUrl: "https://status.datapulse.co.ke",
} as const;

export const WHATSAPP_LINK = `https://wa.me/${SITE.phone}?text=${encodeURIComponent(
  SITE.whatsappMessage
)}`;

export const whatsappLink = (message: string) =>
  `https://wa.me/${SITE.phone}?text=${encodeURIComponent(message)}`;

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;

/* ------------------------------------------------------------------ */
/* Features — Lucide icon names only (brief: no stars/diamonds/sparkles)*/
/* ------------------------------------------------------------------ */

export interface Feature {
  icon: string;
  name: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: "zap",
    name: "Real-Time Revenue Dashboard",
    description:
      "Watch every shilling land as it happens. M-Pesa, card and cash totals refresh on one live screen.",
  },
  {
    icon: "trending-up",
    name: "Sales Forecasting",
    description:
      "Project the next 30, 60 or 90 days from your own history, with a visible confidence band.",
  },
  {
    icon: "users",
    name: "Customer Behaviour Analytics",
    description:
      "See who buys, how often and what they spend. Spot your best accounts before you lose them.",
  },
  {
    icon: "package",
    name: "Inventory Predictions",
    description:
      "Know how many days of stock remain per product and reorder before the shelf runs empty.",
  },
  {
    icon: "clipboard-list",
    name: "Staff Performance Tracking",
    description:
      "Tasks completed, attendance and performance scores per person and per department.",
  },
  {
    icon: "hand-heart",
    name: "Donor and Grant Tracking",
    description:
      "For NGOs: pledges, disbursements and burn rate per grant, ready for the donor report.",
  },
  {
    icon: "graduation-cap",
    name: "Student Performance for Schools",
    description:
      "Mean scores by stream, subject and term, with the pupils who need attention surfaced first.",
  },
  {
    icon: "bed-double",
    name: "Hotel Occupancy Forecasting",
    description:
      "Occupancy, ADR and RevPAR with a forward booking curve built for coastal and safari seasons.",
  },
  {
    icon: "message-circle",
    name: "WhatsApp Report Delivery",
    description:
      "Your numbers arrive on WhatsApp every morning. No login, no laptop, no training needed.",
  },
  {
    icon: "file-bar-chart",
    name: "Custom Report Builder",
    description:
      "Pick metrics, pick a range, pick a chart. Generate a branded PDF in a few clicks.",
  },
  {
    icon: "database",
    name: "M-Pesa & Sheets Integrations",
    description:
      "Connect Daraja and Google Sheets once. Your data flows in without a single manual export.",
  },
  {
    icon: "shield",
    name: "Kenyan Data Protection",
    description:
      "Built to the Data Protection Act 2019. Your business data stays yours, encrypted in transit.",
  },
];

/* ------------------------------------------------------------------ */
/* Use cases                                                           */
/* ------------------------------------------------------------------ */

export interface UseCase {
  slug: string;
  industry: string;
  icon: string;
  challenge: string;
  solution: string;
  metrics: string[];
  image: string;
  imageAlt: string;
}

export const USE_CASES: UseCase[] = [
  {
    slug: "retail-ecommerce",
    industry: "Retail and E-Commerce",
    icon: "shopping-cart",
    challenge:
      "Daily takings live in an M-Pesa statement, a till roll and three WhatsApp groups. By the time the month closes, nobody can say which products actually made money or which branch is quietly bleeding margin.",
    solution:
      "DataPulse pulls M-Pesa Daraja transactions and your POS export into one revenue view, ranks every product by contribution, and predicts stockouts from real sales velocity so reorders happen on time instead of on panic.",
    metrics: [
      "Daily and monthly revenue (KES)",
      "Revenue per product and category",
      "Average order value and basket size",
      "Days of stock remaining per SKU",
      "Repeat purchase rate",
    ],
    image: "/images/use-cases/retail.jpg",
    imageAlt:
      "Kenyan shop owner reviewing sales figures on a laptop behind the counter of her retail store",
  },
  {
    slug: "hotels-hospitality",
    industry: "Hotels and Hospitality",
    icon: "bed-double",
    challenge:
      "Occupancy is tracked in a booking diary, rates are negotiated case by case, and the high season is forecast from memory. Revenue managers find out a weak week is coming only once it has already arrived.",
    solution:
      "Occupancy, ADR and RevPAR are calculated nightly and plotted against the same week last year. A forward booking curve plus a seasonality model flags soft weeks early enough to move rates or push a package.",
    metrics: [
      "Occupancy rate by room type",
      "ADR and RevPAR",
      "Forward booking pace",
      "Revenue per booking channel",
      "Predicted occupancy, next 90 days",
    ],
    image: "/images/use-cases/hospitality.jpg",
    imageAlt: "Hotel manager in an East African lodge reception reviewing occupancy on a tablet",
  },
  {
    slug: "schools-education",
    industry: "Schools and Education",
    icon: "graduation-cap",
    challenge:
      "Mark sheets sit in separate Excel files per teacher, fee arrears live with the bursar, and the board asks for a trend across three terms that nobody has time to assemble by hand.",
    solution:
      "One dashboard for academic and financial performance: mean scores by stream, subject and term, fee collection against target, and an early-warning list of pupils whose results are sliding before the next exam.",
    metrics: [
      "Mean score by class, stream and subject",
      "Term-on-term improvement",
      "Fee collection rate and arrears",
      "Attendance percentage",
      "Pupils flagged for intervention",
    ],
    image: "/images/use-cases/education.jpg",
    imageAlt: "School administrator in Nairobi reviewing student performance data on a computer",
  },
  {
    slug: "ngos-charities",
    industry: "NGOs and Charities",
    icon: "hand-heart",
    challenge:
      "Every donor wants a different template on a different cycle, field data arrives as photographs of paper forms, and proving impact takes three weeks of spreadsheet surgery each quarter.",
    solution:
      "Track beneficiaries reached, spend per outcome and grant burn rate in real time. Programme teams enter data once; donor-ready PDF reports generate against each funder's reporting period automatically.",
    metrics: [
      "Beneficiaries reached by programme",
      "Cost per beneficiary",
      "Grant burn rate and runway",
      "Disbursement against budget line",
      "Outcome indicators by county",
    ],
    image: "/images/use-cases/ngo.jpg",
    imageAlt: "NGO impact team in East Africa reviewing programme data together in a field office",
  },
  {
    slug: "clinics-pharmacies",
    industry: "Clinics and Pharmacies",
    icon: "stethoscope",
    challenge:
      "Dispensing records, NHIF claims and stock counts sit in three systems that never agree. Fast-moving medicines run out while slow stock expires quietly on the back shelf.",
    solution:
      "Consumption analytics per drug line with expiry-aware reorder recommendations, plus claim turnaround tracking so the practice sees exactly where reimbursements are stuck.",
    metrics: [
      "Revenue per service line",
      "Patient visits and return rate",
      "Stock cover days per medicine",
      "Expiry exposure value",
      "Claim turnaround time",
    ],
    image: "/images/use-cases/clinic.jpg",
    imageAlt: "Pharmacist in a Kenyan pharmacy checking stock records on a computer",
  },
  {
    slug: "restaurants-food",
    industry: "Restaurants and Food Service",
    icon: "utensils",
    challenge:
      "Food cost is guessed at month end, the kitchen over-preps on quiet Tuesdays and runs short every Friday, and nobody is certain which menu items are actually profitable after wastage.",
    solution:
      "Daily covers, average spend per head and item-level margin after food cost, with a day-of-week demand forecast the kitchen can prep against instead of guessing.",
    metrics: [
      "Daily covers and average spend",
      "Item-level gross margin",
      "Food cost percentage",
      "Peak hour heatmap",
      "Predicted covers, next 14 days",
    ],
    image: "/images/use-cases/restaurant.jpg",
    imageAlt: "Restaurant manager in Nairobi reviewing daily sales on a tablet in the dining area",
  },
  {
    slug: "law-firms",
    industry: "Law Firms",
    icon: "scale",
    challenge:
      "Billable hours are reconstructed from memory on Friday afternoon, matter profitability is a mystery until the file closes, and partners cannot see which practice areas are carrying the firm.",
    solution:
      "Utilisation and realisation rates per fee earner, profitability per matter and per practice area, and an ageing debtors view that shows exactly which invoices to chase first.",
    metrics: [
      "Billable hours and utilisation rate",
      "Realisation rate per fee earner",
      "Profitability per matter",
      "Revenue by practice area",
      "Debtor days and ageing",
    ],
    image: "/images/use-cases/lawfirm.jpg",
    imageAlt: "Legal professionals in a Nairobi office reviewing figures during a meeting",
  },
  {
    slug: "real-estate",
    industry: "Real Estate Agencies",
    icon: "building-2",
    challenge:
      "Rent collection is tracked per caretaker, vacancy is only noticed when the landlord calls, and agents argue over which listings generate real enquiries versus idle traffic.",
    solution:
      "Portfolio-level occupancy and collection rate, arrears by unit and by tenant, plus a lead-to-let funnel that shows which listing channels actually convert into signed leases.",
    metrics: [
      "Occupancy rate across the portfolio",
      "Rent collection rate and arrears",
      "Average days to let",
      "Lead-to-viewing-to-let conversion",
      "Yield per property",
    ],
    image: "/images/use-cases/realestate.jpg",
    imageAlt: "Real estate agent in Nairobi presenting property performance data to clients",
  },
];

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

export interface Plan {
  id: string;
  name: string;
  monthly: number | null;
  annual: number | null;
  blurb: string;
  featured: boolean;
  cta: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 2_999,
    annual: 29_990, // 2 months free
    blurb: "For small shops, clinics and single-branch businesses finding their numbers.",
    featured: false,
    cta: "Start Free Trial",
    features: [
      "Up to 2 users",
      "5 dashboards",
      "Email reports",
      "Revenue, sales and customer analytics",
      "30-day data history",
      "M-Pesa Daraja integration",
      "Community support",
    ],
  },
  {
    id: "business",
    name: "Business",
    monthly: 7_999,
    annual: 79_990,
    blurb: "For growing multi-branch operations that run on forecasts, not hunches.",
    featured: true,
    cta: "Start Free Trial",
    features: [
      "Up to 10 users",
      "Unlimited dashboards",
      "WhatsApp and email reports",
      "Predictive models: revenue, churn, stockout",
      "24-month data history",
      "M-Pesa, Google Sheets and POS integrations",
      "Custom alert rules",
      "Priority email support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: null,
    annual: null,
    blurb: "For corporates, NGOs, county governments and school groups.",
    featured: false,
    cta: "Request Enterprise Quote",
    features: [
      "Unlimited users",
      "Dedicated onboarding and training",
      "Custom integrations and data pipelines",
      "Role-based access with audit logging",
      "Unlimited data history",
      "Single sign-on",
      "99.9% uptime SLA",
      "Named account manager, priority support",
    ],
  },
];

export const PRICING_FAQ = [
  {
    q: "Can I pay with M-Pesa?",
    a: "Yes. Starter and Business subscriptions can be paid by M-Pesa Paybill, card, or bank transfer. Enterprise agreements are invoiced on your preferred cycle. Every plan is billed in Kenyan Shillings, so there is no foreign exchange surprise on your statement.",
  },
  {
    q: "What does the free trial include?",
    a: "Fourteen days of the full Business plan — every dashboard, every predictive model and WhatsApp report delivery. No card is required to start, and nothing bills automatically when the trial ends.",
  },
  {
    q: "How does annual billing save two months?",
    a: "Annual plans are charged at ten times the monthly price instead of twelve. Starter drops from KES 35,988 to KES 29,990 a year and Business from KES 95,988 to KES 79,990 a year.",
  },
  {
    q: "Who owns the data I upload?",
    a: "You do, completely and at all times. Clause 3 of our Terms is explicit: you retain all rights to your business data, we act only as a processor, and you can export everything or request deletion whenever you choose.",
  },
  {
    q: "Do I need a data analyst to use DataPulse?",
    a: "No. Dashboards are pre-built per industry and the daily summary arrives on WhatsApp in plain language. If you can read a WhatsApp message, you can read your numbers. Onboarding and training are included on Business and Enterprise.",
  },
  {
    q: "What happens if I need something the platform does not do?",
    a: "That is what our custom analytics projects are for. Tell us what you need on the custom project form and we will scope a bespoke dashboard, data pipeline or model on top of the platform.",
  },
  {
    q: "Can I change or cancel my plan?",
    a: "Upgrade, downgrade or cancel at any time from Settings. Changes take effect at the start of your next billing cycle and there are no exit fees or long lock-in contracts.",
  },
];

/* ------------------------------------------------------------------ */
/* Data sources offered on the custom project form                     */
/* ------------------------------------------------------------------ */

export const DATA_SOURCES = [
  "M-Pesa",
  "Excel",
  "Google Sheets",
  "POS System",
  "Custom API",
  "Other",
] as const;

export const BUDGET_RANGES = [
  "Under KES 100,000",
  "KES 100,000 – 250,000",
  "KES 250,000 – 500,000",
  "KES 500,000 – 1,000,000",
  "Over KES 1,000,000",
  "Not sure yet",
] as const;

export const INDUSTRIES = [
  "Retail and E-Commerce",
  "Hotels and Hospitality",
  "Schools and Education",
  "NGOs and Charities",
  "Clinics and Pharmacies",
  "Restaurants and Food Service",
  "Law Firms",
  "Real Estate Agencies",
  "Manufacturing",
  "Logistics and Transport",
  "Financial Services and SACCOs",
  "Government Agency",
  "Other",
] as const;

/* ------------------------------------------------------------------ */
/* Dashboard sidebar                                                   */
/* ------------------------------------------------------------------ */

export const DASHBOARD_TABS = [
  { key: "overview", label: "Overview", icon: "layout-dashboard" },
  { key: "revenue", label: "Revenue", icon: "line-chart" },
  { key: "sales", label: "Sales", icon: "bar-chart-2" },
  { key: "customers", label: "Customers", icon: "users" },
  { key: "inventory", label: "Inventory", icon: "package" },
  { key: "staff", label: "Staff", icon: "user-check" },
  { key: "reports", label: "Reports", icon: "file-bar-chart" },
  { key: "predictions", label: "Predictions", icon: "trending-up" },
  { key: "alerts", label: "Alerts", icon: "bell" },
  { key: "settings", label: "Settings", icon: "settings" },
] as const;
