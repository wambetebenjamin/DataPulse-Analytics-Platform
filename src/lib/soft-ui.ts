/**
 * Soft UI token resolution helpers.
 *
 * Direct ports of src/assets/theme/functions/*.js from the design source zip:
 *   pxToRem.js, linearGradient.js, boxShadow.js, rgba.js, hexToRgb.js
 * and the colour/gradient/radius/shadow resolution logic inside
 * src/components/SoftBox/SoftBoxRoot.js.
 *
 * See DESIGN-SOURCE-AUDIT.md §4.6.
 */

export type SoftColor =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "light"
  | "dark";

export type SoftTextColor = SoftColor | "inherit" | "text" | "white";
export type SoftButtonColor = SoftColor | "white";
export type SoftVariant = "contained" | "gradient";
export type SoftRadius = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "section";
export type SoftShadow = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "inset";
export type SoftFontWeight = false | "light" | "regular" | "medium" | "bold";
export type SoftSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

/** pxToRem.js — `${number / baseNumber}rem` */
export function pxToRem(value: number, baseNumber = 16): string {
  return `${value / baseNumber}rem`;
}

/** linearGradient.js — default angle 310deg */
export function linearGradient(color: string, colorState: string, angle = 310): string {
  return `linear-gradient(${angle}deg, ${color}, ${colorState})`;
}

/** hexToRgb.js (chroma-js equivalent, hex only) */
export function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255].join(", ");
}

/** rgba.js */
export function rgba(hex: string, opacity: number): string {
  return `rgba(${hexToRgb(hex)}, ${opacity})`;
}

/** boxShadow.js — boxShadow([x,y],[blur,spread], color, opacity, inset) */
export function boxShadow(
  offset: [number, number],
  radius: [number, number],
  color: string,
  opacity: number,
  inset = ""
): string {
  const [x, y] = offset;
  const [blur, spread] = radius;
  return `${inset} ${pxToRem(x)} ${pxToRem(y)} ${pxToRem(blur)} ${pxToRem(spread)} ${rgba(
    color,
    opacity
  )}`.trim();
}

/* ------------------------------------------------------------------ */
/* Literal palette, mirroring colors.js                                */
/* ------------------------------------------------------------------ */

export const SOFT_COLORS = {
  primary: "#cb0c9f",
  secondary: "#8392ab",
  info: "#17c1e8",
  success: "#82d616",
  warning: "#fbcf33",
  error: "#ea0606",
  light: "#e9ecef",
  dark: "#344767",
  white: "#ffffff",
  black: "#000000",
  text: "#67748e",
  transparent: "transparent",
} as const;

export const SOFT_GREY = {
  "grey-100": "#f8f9fa",
  "grey-200": "#e9ecef",
  "grey-300": "#dee2e6",
  "grey-400": "#ced4da",
  "grey-500": "#adb5bd",
  "grey-600": "#6c757d",
  "grey-700": "#495057",
  "grey-800": "#343a40",
  "grey-900": "#212529",
} as const;

export const SOFT_GRADIENTS: Record<SoftColor, { main: string; state: string }> = {
  primary: { main: "#7928ca", state: "#ff0080" },
  secondary: { main: "#627594", state: "#a8b8d8" },
  info: { main: "#2152ff", state: "#21d4fd" },
  success: { main: "#17ad37", state: "#98ec2d" },
  warning: { main: "#f53939", state: "#fbcf33" },
  error: { main: "#ea0606", state: "#ff667c" },
  light: { main: "#ced4da", state: "#ebeff4" },
  dark: { main: "#141727", state: "#3a416f" },
};

export const SOFT_BADGE: Record<SoftColor, { background: string; text: string }> = {
  primary: { background: "#f883dd", text: "#a3017e" },
  secondary: { background: "#e4e8ed", text: "#5974a2" },
  info: { background: "#abe9f7", text: "#08a1c4" },
  success: { background: "#cdf59b", text: "#67b108" },
  warning: { background: "#fef5d3", text: "#fbc400" },
  error: { background: "#fc9797", text: "#bd0000" },
  light: { background: "#ffffff", text: "#c7d3de" },
  dark: { background: "#8097bf", text: "#1e2e4a" },
};

export const SOFT_ALERT: Record<SoftColor, { main: string; state: string; border: string }> = {
  primary: { main: "#7928ca", state: "#d6006c", border: "#efb6e2" },
  secondary: { main: "#627594", state: "#8ca1cb", border: "#dadee6" },
  info: { main: "#2152ff", state: "#02c6f3", border: "#b9ecf8" },
  success: { main: "#17ad37", state: "#84dc14", border: "#daf3b9" },
  warning: { main: "#f53939", state: "#fac60b", border: "#fef1c2" },
  error: { main: "#ea0606", state: "#ff3d59", border: "#f9b4b4" },
  light: { main: "#ced4da", state: "#d1dae6", border: "#f8f9fa" },
  dark: { main: "#141727", state: "#2c3154", border: "#c2c8d1" },
};

export const SOFT_RADIUS: Record<string, string> = {
  none: "0",
  xs: pxToRem(2),
  sm: pxToRem(4),
  md: pxToRem(8),
  lg: pxToRem(12),
  xl: pxToRem(16),
  xxl: pxToRem(24),
  section: pxToRem(160),
};

export const SOFT_SHADOW: Record<string, string> = {
  none: "none",
  xs: "var(--dp-shadow-xs)",
  sm: "var(--dp-shadow-sm)",
  md: "var(--dp-shadow-md)",
  lg: "var(--dp-shadow-lg)",
  xl: "var(--dp-shadow-xl)",
  xxl: "var(--dp-shadow-xxl)",
  inset: "var(--dp-shadow-inset)",
};

export const SOFT_FONT_WEIGHT: Record<string, number> = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700,
};

/** SoftBoxRoot.js background resolution */
export function resolveBackground(variant: SoftVariant, bgColor: string): string {
  if (variant === "gradient") {
    const g = SOFT_GRADIENTS[bgColor as SoftColor];
    return g ? linearGradient(g.main, g.state) : SOFT_COLORS.white;
  }
  if (bgColor in SOFT_COLORS) return SOFT_COLORS[bgColor as keyof typeof SOFT_COLORS];
  if (bgColor in SOFT_GREY) return SOFT_GREY[bgColor as keyof typeof SOFT_GREY];
  return bgColor;
}

/** SoftBoxRoot.js colour resolution */
export function resolveColor(color: string): string {
  if (color in SOFT_COLORS) return SOFT_COLORS[color as keyof typeof SOFT_COLORS];
  if (color in SOFT_GREY) return SOFT_GREY[color as keyof typeof SOFT_GREY];
  return color;
}

/** Text-gradient treatment from SoftTypographyRoot.js */
export function textGradientStyle(color: SoftColor): React.CSSProperties {
  const g = SOFT_GRADIENTS[color];
  return {
    backgroundImage: linearGradient(g.main, g.state),
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    position: "relative",
    zIndex: 1,
  };
}
