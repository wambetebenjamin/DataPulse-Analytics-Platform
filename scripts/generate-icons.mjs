/**
 * Generates the PNG app icons from the same geometry as public/favicon.svg.
 *
 * Written by hand rather than pulled from a raster library: the artwork is a
 * rounded square, a gradient and four bars, which is a few dozen lines of
 * pixel maths and avoids adding sharp/canvas (and their native builds) to the
 * dependency tree. No AI-generated imagery is involved.
 *
 *   node scripts/generate-icons.mjs
 */

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* Soft UI info gradient: linear-gradient(310deg, #2152ff, #21d4fd) */
const GRAD_FROM = [33, 82, 255];
const GRAD_TO = [33, 212, 253];
const WHITE = [255, 255, 255];

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n += 1) {
    c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Signed distance to a rounded rectangle, used for anti-aliased edges. */
function roundedRectDistance(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

function drawIcon(size, { padding = 0, radiusRatio = 0.2232 } = {}) {
  const rgba = Buffer.alloc(size * size * 4, 0);
  const inner = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const hw = inner / 2;
  const radius = inner * radiusRatio;

  // Four bars rising left to right — the DataPulse mark.
  const barCount = 4;
  const barGap = inner * 0.072;
  const barWidth = (inner * 0.58 - barGap * (barCount - 1)) / barCount;
  const barLeft = cx - inner * 0.29;
  const baseline = cy + inner * 0.22;
  const heights = [0.18, 0.28, 0.37, 0.46].map((h) => inner * h);
  const barRadius = barWidth * 0.34;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const i = (y * size + x) * 4;

      const d = roundedRectDistance(px, py, cx, cy, hw, hw, radius);
      const alpha = Math.max(0, Math.min(1, 0.5 - d));
      if (alpha <= 0) continue;

      // 310deg gradient ≈ travelling up-and-right across the square.
      const t = Math.max(0, Math.min(1, (px / size) * 0.62 + (1 - py / size) * 0.38));
      let r = lerp(GRAD_FROM[0], GRAD_TO[0], t);
      let g = lerp(GRAD_FROM[1], GRAD_TO[1], t);
      let b = lerp(GRAD_FROM[2], GRAD_TO[2], t);

      // Bars, drawn in white over the gradient.
      let barAlpha = 0;
      for (let k = 0; k < barCount; k += 1) {
        const left = barLeft + k * (barWidth + barGap);
        const bcx = left + barWidth / 2;
        const bh = heights[k];
        const bcy = baseline - bh / 2;
        const bd = roundedRectDistance(px, py, bcx, bcy, barWidth / 2, bh / 2, barRadius);
        barAlpha = Math.max(barAlpha, Math.max(0, Math.min(1, 0.5 - bd)));
      }

      if (barAlpha > 0) {
        r = lerp(r, WHITE[0], barAlpha);
        g = lerp(g, WHITE[1], barAlpha);
        b = lerp(b, WHITE[2], barAlpha);
      }

      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = Math.round(alpha * 255);
    }
  }

  return encodePng(size, size, rgba);
}

const targets = [
  { file: "public/apple-icon.png", size: 180, opts: { padding: 0, radiusRatio: 0.2232 } },
  { file: "public/icon-512.png", size: 512, opts: { padding: 48, radiusRatio: 0.26 } },
  { file: "public/icon-192.png", size: 192, opts: { padding: 18, radiusRatio: 0.26 } },
];

for (const target of targets) {
  const out = join(ROOT, target.file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, drawIcon(target.size, target.opts));
  console.log(`wrote ${target.file} (${target.size}×${target.size})`);
}
