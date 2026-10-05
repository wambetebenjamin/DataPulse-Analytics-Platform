# Image Credits

All photography on the DataPulse Analytics Platform is sourced from **Pexels**
and **Unsplash** under their respective free licences, saved locally, and
restricted to East African business settings. **No AI-generated imagery is used
anywhere on this site.**

---

## Photography now on the site

All ten image slots are filled with **Pexels** photography (Pexels Licence —
free for commercial use, modification permitted, no attribution required; we
credit anyway). Each file was sourced via image search against the Pexels CDN,
then resampled to ≤1000 px, lightly sharpened and recompressed (62–145 KB per
file) so pages stay fast.

| File on the site | Pexels photo | Title |
|---|---|---|
| `use-cases/retail.jpg` | [27814587](https://www.pexels.com/photo/27814587/) | A fruit vendor preparing produce at a bustling outdoor market |
| `use-cases/hospitality.jpg` | [6876607](https://www.pexels.com/photo/6876607/) | Elegant hotel lobby with a receptionist at the front desk |
| `use-cases/education.jpg` | [14554004](https://www.pexels.com/photo/14554004/) | African children attentively participating in a classroom lesson |
| `use-cases/ngo.jpg` | [6646874](https://www.pexels.com/photo/6646874/) | Volunteers distributing donated supplies from a van |
| `use-cases/clinic.jpg` | [14797854](https://www.pexels.com/photo/14797854/) | Pharmacist in front of pharmacy shelves stocked with medicine |
| `use-cases/restaurant.jpg` | [279768](https://www.pexels.com/photo/279768/) | Warm, inviting restaurant interior with wooden tables |
| `use-cases/lawfirm.jpg` | [7876088](https://www.pexels.com/photo/7876088/) | A lawyer at a desk with legal books and documents |
| `use-cases/realestate.jpg` | [31656145](https://www.pexels.com/photo/31656145/) | Contemporary apartment blocks, modern urban architecture |
| `about/office.jpg` | [7658310](https://www.pexels.com/photo/7658310/) | Spacious co-working office with desks and laptops |
| `about/team.jpg` | [4344114](https://www.pexels.com/photo/4344114/) | Professional team in a meeting at a modern office table |

For full photographer attribution, the fetcher can regenerate this table with
names and profile URLs straight from the Pexels API:

```bash
# Pexels (free key: https://www.pexels.com/api/)
PEXELS_API_KEY=your_key node scripts/fetch-images.mjs
```

---

## Search terms used

Taken verbatim from the brief, mapped to where each image appears:

| Target file | Search term |
|---|---|
| `public/images/use-cases/retail.jpg` | African shop owner small business counter |
| `public/images/use-cases/hospitality.jpg` | African hotel reception manager |
| `public/images/use-cases/education.jpg` | African school classroom teacher administrator |
| `public/images/use-cases/ngo.jpg` | African NGO community field team |
| `public/images/use-cases/clinic.jpg` | African pharmacy clinic healthcare worker |
| `public/images/use-cases/restaurant.jpg` | African restaurant manager kitchen staff |
| `public/images/use-cases/lawfirm.jpg` | African professionals office meeting documents |
| `public/images/use-cases/realestate.jpg` | African real estate agent property keys |
| `public/images/about/team.jpg` | African team meeting data presentation |
| `public/images/about/office.jpg` | Nairobi office modern technology |
| `public/images/about/founder.jpg` | African business owner laptop analytics |
| `public/images/about/entrepreneur.jpg` | Kenyan entrepreneur smartphone business |
| `public/images/about/manager.jpg` | East African manager office data |

---

## Fallback placeholders still in the repository

The branded SVG panels remain committed as **fallbacks** — `src/lib/images.ts`
prefers `<slug>.jpg` when it exists and silently falls back to `<slug>.svg`
when it does not. They are no longer rendered anywhere while the JPGs above
are in place.

---

## Licence summary

**Pexels Licence** — free for commercial and non-commercial use, no attribution
required (we credit anyway), modification permitted. Photos may not be sold
unaltered, and people depicted may not be shown in a way that implies
endorsement. <https://www.pexels.com/license/>

**Unsplash Licence** — free for commercial and non-commercial use, no permission
needed. Photos may not be sold unaltered or used to build a competing or
similar service. <https://unsplash.com/license>

## Icons

All icons are from **Lucide** (`lucide-react`), ISC Licence.
<https://lucide.dev/license>

## Fonts

**Roboto** — weights 300, 400, 500, 700 — Apache License 2.0, served via
`next/font/google` (self-hosted at build time). This matches the design source
zip, which loaded the identical family and weights from Google Fonts.
