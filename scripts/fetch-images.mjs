#!/usr/bin/env node
/**
 * Pexels / Unsplash image fetcher.
 *
 * The brief requires photography from Pexels and Unsplash only, East African
 * business settings, saved locally, credited in image-credits.md, and no AI
 * imagery. The build sandbox has no egress to those CDNs, so this script does
 * the sourcing in any environment that does (your laptop, CI, or a Vercel
 * build step) and writes real attribution from the API response — nothing is
 * hand-written or invented.
 *
 * Usage:
 *   PEXELS_API_KEY=xxxx node scripts/fetch-images.mjs
 *   UNSPLASH_ACCESS_KEY=yyyy node scripts/fetch-images.mjs --provider unsplash
 *
 * Keys are free:
 *   https://www.pexels.com/api/
 *   https://unsplash.com/developers
 *
 * Until it is run the app falls back to the committed branded SVG
 * placeholders in public/images/** — nothing ever renders broken.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "images");

/** Search terms taken verbatim from the brief, mapped to where they are used. */
const TARGETS = [
  { slug: "use-cases/retail", query: "African shop owner small business counter" },
  { slug: "use-cases/hospitality", query: "African hotel reception manager" },
  { slug: "use-cases/education", query: "African school classroom teacher administrator" },
  { slug: "use-cases/ngo", query: "African NGO community field team" },
  { slug: "use-cases/clinic", query: "African pharmacy clinic healthcare worker" },
  { slug: "use-cases/restaurant", query: "African restaurant manager kitchen staff" },
  { slug: "use-cases/lawfirm", query: "African professionals office meeting documents" },
  { slug: "use-cases/realestate", query: "African real estate agent property keys" },
  { slug: "about/team", query: "African team meeting data presentation" },
  { slug: "about/office", query: "Nairobi office modern technology" },
  { slug: "about/founder", query: "African business owner laptop analytics" },
  { slug: "about/entrepreneur", query: "Kenyan entrepreneur smartphone business" },
  { slug: "about/manager", query: "East African manager office data" },
];

const provider = process.argv.includes("--provider")
  ? process.argv[process.argv.indexOf("--provider") + 1]
  : "pexels";

async function fromPexels(query) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error("PEXELS_API_KEY is not set.");
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    query
  )}&per_page=1&orientation=landscape&size=large`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) throw new Error(`Pexels ${res.status} for "${query}"`);
  const data = await res.json();
  const photo = data.photos?.[0];
  if (!photo) return null;
  return {
    downloadUrl: photo.src.large2x ?? photo.src.large,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    pageUrl: photo.url,
    alt: photo.alt || query,
    source: "Pexels",
    licence: "Pexels Licence — free to use, attribution appreciated",
  };
}

async function fromUnsplash(query) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error("UNSPLASH_ACCESS_KEY is not set.");
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query
  )}&per_page=1&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } });
  if (!res.ok) throw new Error(`Unsplash ${res.status} for "${query}"`);
  const data = await res.json();
  const photo = data.results?.[0];
  if (!photo) return null;
  return {
    downloadUrl: `${photo.urls.raw}&w=1600&q=80&fm=jpg&fit=crop`,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
    pageUrl: photo.links.html,
    alt: photo.alt_description || query,
    source: "Unsplash",
    licence: "Unsplash Licence — free to use, attribution appreciated",
  };
}

async function main() {
  const lookup = provider === "unsplash" ? fromUnsplash : fromPexels;
  const credits = [];

  for (const target of TARGETS) {
    process.stdout.write(`→ ${target.slug.padEnd(26)} "${target.query}" ... `);
    try {
      const meta = await lookup(target.query);
      if (!meta) {
        console.log("no result, keeping placeholder");
        continue;
      }
      const img = await fetch(meta.downloadUrl);
      if (!img.ok) throw new Error(`download ${img.status}`);
      const buf = Buffer.from(await img.arrayBuffer());

      const dest = join(OUT, `${target.slug}.jpg`);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, buf);

      credits.push({ ...meta, file: `public/images/${target.slug}.jpg`, query: target.query });
      console.log(`ok (${(buf.length / 1024).toFixed(0)} kB)`);
    } catch (err) {
      console.log(`failed — ${err.message}`);
    }
    // Stay well inside the free-tier rate limits.
    await new Promise((r) => setTimeout(r, 350));
  }

  if (!credits.length) {
    console.error("\nNo images were downloaded. image-credits.md was left untouched.");
    process.exit(1);
  }

  const md = `# Image Credits

All photography on the DataPulse Analytics Platform is sourced from **Pexels**
and **Unsplash** under their respective free licences. No AI-generated imagery
is used anywhere on this site.

Generated by \`scripts/fetch-images.mjs\` on ${new Date().toISOString().slice(0, 10)}.
Attribution below is taken directly from the provider API — nothing is hand-written.

| File | Photographer | Source | Search term | Licence |
|---|---|---|---|---|
${credits
  .map(
    (c) =>
      `| \`${c.file}\` | [${c.photographer}](${c.photographerUrl}) | [${c.source}](${c.pageUrl}) | ${c.query} | ${c.licence} |`
  )
  .join("\n")}

## Licence summary

**Pexels Licence** — free for commercial and non-commercial use, no attribution
required (we credit anyway), modification permitted. Photos may not be sold
unaltered or used to imply endorsement by people depicted.
<https://www.pexels.com/license/>

**Unsplash Licence** — free for commercial and non-commercial use, no permission
needed. Photos may not be sold unaltered or used to build a competing service.
<https://unsplash.com/license>

## Re-running

\`\`\`bash
PEXELS_API_KEY=your_key node scripts/fetch-images.mjs
# or
UNSPLASH_ACCESS_KEY=your_key node scripts/fetch-images.mjs --provider unsplash
\`\`\`
`;

  await writeFile(join(ROOT, "image-credits.md"), md);
  console.log(`\nWrote ${credits.length} images and image-credits.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
