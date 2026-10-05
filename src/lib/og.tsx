import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Shared Open Graph card renderer.
 *
 * Satori (behind next/og) cannot read WOFF2, so the self-hosted Roboto WOFF
 * files are used. Keeping one renderer here means /pricing, /use-cases and
 * every blog post share exactly one visual language.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

let fontCache: { regular: Buffer; bold: Buffer } | null = null;

async function fonts() {
  if (fontCache) return fontCache;
  const dir = join(process.cwd(), "src", "app", "_og");
  const [regular, bold] = await Promise.all([
    readFile(join(dir, "roboto-400.woff")),
    readFile(join(dir, "roboto-700.woff")),
  ]);
  fontCache = { regular, bold };
  return fontCache;
}

export interface OgCardProps {
  /** Small uppercase label above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Short strings rendered as chips along the bottom. */
  tags?: string[];
  footer?: string;
}

export async function renderOgCard({
  eyebrow = "DataPulse Analytics",
  title,
  description,
  tags = [],
  footer = "datapulse.co.ke · Nairobi, Kenya",
}: OgCardProps) {
  const { regular, bold } = await fonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 72px",
          background: "linear-gradient(135deg, #141727 0%, #2152ff 58%, #21d4fd 100%)",
          color: "#ffffff",
          fontFamily: "Roboto",
        }}
      >
        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
              width: 56,
              height: 56,
              padding: 12,
              borderRadius: 14,
              background: "rgba(255,255,255,0.14)",
            }}
          >
            <div style={{ width: 6, height: 11, borderRadius: 2, background: "#ffffff" }} />
            <div style={{ width: 6, height: 18, borderRadius: 2, background: "#ffffff" }} />
            <div style={{ width: 6, height: 25, borderRadius: 2, background: "#ffffff" }} />
            <div style={{ width: 6, height: 32, borderRadius: 2, background: "#ffffff" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}>
              DataPulse Analytics
            </span>
            <span
              style={{
                fontSize: 17,
                color: "rgba(255,255,255,0.68)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </span>
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
          <span
            style={{
              fontSize: title.length > 64 ? 56 : 68,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.025em",
            }}
          >
            {title}
          </span>
          {description ? (
            <span
              style={{
                marginTop: 22,
                fontSize: 27,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.8)",
                maxWidth: 900,
              }}
            >
              {description}
            </span>
          ) : null}
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "9px 18px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontSize: 19,
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 19, color: "rgba(255,255,255,0.62)" }}>{footer}</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Roboto", data: regular, weight: 400, style: "normal" },
        { name: "Roboto", data: bold, weight: 700, style: "normal" },
      ],
    }
  );
}
