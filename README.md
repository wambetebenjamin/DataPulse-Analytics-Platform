# DataPulse Analytics Platform

Business intelligence and custom analytics for East African organisations — SMEs,
corporates, NGOs, schools, hotels and government. Built in Nairobi, Kenya.

Website 25 of the 100 Website Challenge.

- **Marketing site** — positioning, pricing in KES, eight industry use cases, blog, enquiry forms.
- **Public demo** — a real dashboard running on sample data, no sign-up required.
- **Authenticated product** — ten dashboard tabs behind NextAuth with four-tier role gating.

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript (strict) |
| Styling | CSS Modules + custom properties — design tokens in `src/styles/tokens.css` |
| Charts | Recharts 2.15 |
| Icons | Lucide, via the registry in `src/components/Icon.tsx` |
| Auth | NextAuth 4 (credentials), JWT sessions |
| Fonts | Self-hosted Roboto (`@fontsource/roboto`) |
| PDF / CSV | jsPDF + autotable, hand-rolled CSV writer |
| Hosting | Vercel |

The visual language is ported from **Soft UI Dashboard React v4.0.1** (Creative Tim).
That source is a CRA + MUI + Chart.js SPA; every deviation made while porting it to
this stack is catalogued in [`DESIGN-SOURCE-AUDIT.md`](./DESIGN-SOURCE-AUDIT.md) §16.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # every value is optional for local development
npm run dev                  # http://localhost:3000
```

The app boots with **no environment variables set**. Integrations degrade to a
documented no-op, reCAPTCHA is skipped in development, and outbound mail is
written to stdout instead of being sent. `.env.example` explains what each of the
30 variables unlocks.

For a working sign-in locally you only need:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### Demo accounts

All seeded accounts share the password in `DEMO_ACCOUNT_PASSWORD`
(default `datapulse2026`). They exist to exercise role gating:

| Email | Role | Can open |
| --- | --- | --- |
| `owner@datapulse.co.ke` | Owner | all ten tabs |
| `grace@datapulse.co.ke` | Manager | all except Settings |
| `faith@datapulse.co.ke` | Analyst | all except Staff, Alerts, Settings |
| `daniel@datapulse.co.ke` | Viewer | Overview, Revenue, Reports |
| `amina@datapulse.co.ke` | Analyst | **blocked** — status is `Invited`, not `Active` |

### Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint

node scripts/generate-icons.mjs  # regenerate the PNG app icons from favicon.svg
node scripts/fetch-images.mjs    # download photography (needs PEXELS_API_KEY)
```

---

## Layout

```
content/blog/           six MDX posts
public/images/          photography and placeholders
scripts/                icon generation, image fetching
src/app/
  (marketing)/          public pages — home, pricing, use-cases, demo, blog, legal
  (auth)/               login, signup
  app/dashboard/        authenticated product; [tab] dispatches the nine sub-tabs
  api/                  public forms, dashboard data, reports, integrations, team
  middleware.ts         auth gate, edge rate limiting, security headers
src/components/
  charts/               Recharts wrappers with a shared visual grammar
  dashboard/tabs/       the ten dashboard tabs
  marketing/            navbar, hero, globe, pricing table, footer
  soft/                 Soft UI primitives (Box, Typography, Button, …)
src/data/analytics.ts   seeded dataset, anchored to 2026-10-05
src/data/site.ts        site copy, nav, features, plans, use cases
src/lib/                auth, mail, captcha, rate limiting, CSV, PDF, OG, WhatsApp
```

---

## Security and access control

- **Edge middleware** gates `/app/**`, rate limits the public API at 60 req/min per
  IP, and sends `no-store` on every authenticated response.
- **Every protected API route** calls `requireUser({ tab, write, admin })` before
  touching data — the page gate is never the only check.
- **`vercel.json`** sets CSP, HSTS, `X-Frame-Options`, `Referrer-Policy` and
  `Permissions-Policy`; `/app` and `/api` are additionally `noindex`.
- **reCAPTCHA v3** protects registration, suspicious logins and all four public
  forms, falling back to a v2 checkbox below score 0.5. Secrets stay server-side.
- **Kenya DPA 2019** — cookie consent is opt-in per category, the M-Pesa callback
  stores a SHA-256 payer pseudonym rather than a phone number, and retention
  periods are stated in `/legal/privacy-policy`.

## Analytics honesty

Every derived metric carries a *"How is this calculated?"* expander naming its
inputs, and every forecast, churn score and stock-out date is tagged as an
estimate. The models are deliberately simple and auditable — OLS over a 60-day
window for revenue projection, a recency/frequency/value blend for churn,
velocity against supplier lead time for stock-out.

## Accessibility

Body text ≥ 15px and metadata ≥ 11px throughout, contrast verified against every
panel and chart background, a skip link ahead of the navbar, visible focus rings,
and `prefers-reduced-motion` disabling all animation. Layouts are checked at
1440 / 1024 / 768 / 390 / 320.

## Imagery

Photography is Pexels/Unsplash only, East African business settings, downloaded
and served locally, with attribution in [`image-credits.md`](./image-credits.md).
No AI-generated imagery. Where a photograph has not yet been sourced, a branded
SVG placeholder stands in; `scripts/fetch-images.mjs` swaps in the real files.

---

© 2026 DataPulse Analytics. Nairobi, Kenya.
