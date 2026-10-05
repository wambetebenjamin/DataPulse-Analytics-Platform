# Production Deployment Runbook

> **Read this first: the demo needs none of this.**
> This project is a self-contained portfolio demo (Website 25 of the 100
> Website Challenge). It runs with zero configuration — no domain, no
> environment variables, no external services — using seeded data and the
> demo accounts in the README. Everything below is **optional reference**
> for the day you want to put it on the public internet (free
> `*.vercel.app` URL) or give it a real `.co.ke` domain.

> **Status as of 2026-10-05 — "No Production Deployment"**

The app itself is deployable. `next build` completes with zero errors, every
route compiles, and a full smoke test of the production build (marketing pages,
blog, demo, auth flow, gated dashboard, API, sitemap/robots, 404) passes.
What is missing is the **infrastructure**: nothing is deployed anywhere.

## Diagnosis

| Check | Result |
| --- | --- |
| `next build` (production) | ✅ passes — all routes, middleware included |
| Production-mode smoke test (`next start`) | ✅ all pages 200, auth gate + login flow verified |
| Vercel GitHub integration on this repo | ❌ absent — zero commit statuses / check-runs on `main` |
| GitHub Pages | ❌ not configured (and not viable: the app needs API routes + middleware) |
| `datapulse-analytics.co.ke` DNS | ❌ **NXDOMAIN** — KeNIC nameservers return "no such domain"; the domain is not registered (or has no DNS records), so it can never serve traffic |

So the "production domain" fails at the very first step — DNS. And no hosting
project is connected to this repository. Both must be fixed; the first can be
fixed in about five minutes with a free domain.

## Fast path — live in ~5 minutes (free `*.vercel.app` URL)

1. Sign in at [vercel.com](https://vercel.com) → **Add New… → Project**.
2. Import `wambetebenjamin/DataPulse-Analytics-Platform`. Vercel auto-detects
   Next.js; `vercel.json` already pins the region (`fra1`) and all security
   headers, redirects and cache rules.
3. **Before the first deploy**, add these Environment Variables (Production):

   | Variable | Value | Why |
   | --- | --- | --- |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Signs sessions. Falls back to an insecure dev secret if unset. |
   | `NEXT_PUBLIC_SITE_URL` | `https://<project>.vercel.app` | Drives `metadataBase`, sitemap, robots, OG tags, absolute links in report emails. Defaults to the not-yet-registered `.co.ke` domain if unset. |
   | `DEMO_ACCOUNT_PASSWORD` | a strong secret | Shared password for the five seeded demo accounts. Defaults to `datapulse2026` — change it before real traffic. |

   Everything else in `.env.example` is optional: integrations degrade to a
   documented no-op, reCAPTCHA falls back to a v2 checkbox, and outbound mail
   is logged instead of sent.
4. **Deploy**. The production URL (`https://<project>.vercel.app`) serves
   traffic immediately, with HTTPS, previews for every PR, and deployments on
   every push to `main`.

## Custom domain — when you're ready for the `.co.ke`

`datapulse-analytics.co.ke` must first **exist in DNS**:

1. Register it through any KeNIC-accredited registrar (the .ke registry lists
   them at [kenic.or.ke](https://www.kenic.or.ke)). `.co.ke` domains require
   registrant details and run roughly KES 1,500–3,000/year.
2. In the Vercel project → **Settings → Domains** → add
   `datapulse-analytics.co.ke` and `www.datapulse-analytics.co.ke`.
3. At the registrar's DNS panel, create the records Vercel shows (typically
   `A 76.76.21.21` on the apex and `CNAME cname.vercel-dns.com` on `www`,
   plus the `_vercel` TXT for validation). DNS can take minutes–hours to
   propagate; Vercel issues the certificate automatically once it resolves.
4. Update the environment for the final domain and redeploy:
   `NEXT_PUBLIC_SITE_URL=https://datapulse-analytics.co.ke`.
5. `status.datapulse.co.ke` (linked in the footer) is a separate subdomain —
   point it at a status page or remove the link.

## Dependency security (as of 2026-10-05)

The Vercel build blocks on dependencies with known critical advisories —
`next-mdx-remote@5.0.0` (CVE-2026-0969, critical RCE, fixed in 6.0.0) was the
one that failed this project's build; it is now pinned to **6.0.0**. Also
upgraded while fixing: `next` 14.2.33 → 14.2.35, `next-auth` 4.24.11 → 4.24.15,
`jspdf` 2.5.2 → 4.2.1 + `jspdf-autotable` 3.8.4 → 5.0.8 (clears the dompurify
advisory chain), `nodemailer` 6.9.16 → 7.0.13 (satisfies next-auth's peer range
and clears the uuid advisory). `npm audit --omit=dev` went from 8 findings
(3 critical) to 4 (1 critical, framework-level).

Known and deliberately deferred:

| Package | Severity | Fix requires | Why deferred |
| --- | --- | --- | --- |
| `next` 14.2.35 (+ bundled `postcss`) | critical/high | `next@16.3.8` | Major migration (React 19, breaking API changes). Do it as its own PR with a full regression pass. |
| `nodemailer` 7.0.13 | high | `nodemailer@10.0.6+` | Conflicts with `next-auth@4.24.15`'s peer range (`^7.0.7`). No practical exposure here: SMTP is never configured in the demo (mail logs to stdout) and the injection vectors need attacker-controlled transport options. |

Before deploying, re-run `npm audit --omit=dev` — new advisories get published
constantly, and Vercel may start blocking on any of them.

## Post-deploy verification checklist

Run these against the production URL (they mirror the smoke test performed on
2026-10-05 against the local production build — all expected results are shown):

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://YOUR-DOMAIN/            # 200
curl -s -o /dev/null -w '%{http_code}\n' https://YOUR-DOMAIN/pricing     # 200
curl -s -o /dev/null -w '%{http_code}\n' https://YOUR-DOMAIN/demo        # 200
curl -s -o /dev/null -w '%{http_code}\n' https://YOUR-DOMAIN/blog        # 200
curl -sI https://YOUR-DOMAIN/app/dashboard | grep -i location            # 307 -> /login?callbackUrl=…
curl -s https://YOUR-DOMAIN/api/auth/providers                          # JSON, credentials provider
curl -s https://YOUR-DOMAIN/sitemap.xml | head                          # absolute URLs on YOUR-DOMAIN
curl -s -o /dev/null -w '%{http_code}\n' https://YOUR-DOMAIN/nope        # 404
```

Then log in as `owner@datapulse.co.ke` (password = `DEMO_ACCOUNT_PASSWORD`)
and confirm all ten dashboard tabs render.

## Why not GitHub Pages?

The product half of the site is dynamic: NextAuth session handling, 15 API
routes (dashboard data, reports, integrations, forms) and edge middleware for
rate limiting and the auth gate. `output: export` cannot serve any of that.
A serverless Next.js host (Vercel, or Netlify/Render/Railway with the Next
adapter) is required.
