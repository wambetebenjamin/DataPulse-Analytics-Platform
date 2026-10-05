import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Resolve a site image.
 *
 * The brief requires Pexels/Unsplash photography saved locally. Those CDNs are
 * unreachable from this build sandbox, so `scripts/fetch-images.mjs` performs
 * the sourcing wherever there IS egress and drops `<slug>.jpg` into
 * public/images. Until then the committed branded SVG placeholder is served,
 * so nothing ever renders broken.
 *
 * Server-only (uses fs) — call from server components.
 */
export function resolveImage(slug: string): { src: string; isPlaceholder: boolean } {
  const jpg = join(process.cwd(), "public", "images", `${slug}.jpg`);
  if (existsSync(jpg)) return { src: `/images/${slug}.jpg`, isPlaceholder: false };

  const webp = join(process.cwd(), "public", "images", `${slug}.webp`);
  if (existsSync(webp)) return { src: `/images/${slug}.webp`, isPlaceholder: false };

  return { src: `/images/${slug}.svg`, isPlaceholder: true };
}
