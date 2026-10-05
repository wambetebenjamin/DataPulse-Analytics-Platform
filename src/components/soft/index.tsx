/**
 * Soft UI primitives — TypeScript rebuild of the src/components/Soft* family from the
 * design source zip. Prop names, unions and defaults are identical to the
 * originals (DESIGN-SOURCE-AUDIT.md §3.1); only the styling engine changed
 * from MUI/Emotion to CSS Modules + custom properties.
 */

import React from "react";
import clsx from "clsx";
import styles from "./soft.module.css";
import {
  SOFT_ALERT,
  SOFT_BADGE,
  SOFT_COLORS,
  SOFT_FONT_WEIGHT,
  SOFT_GRADIENTS,
  SOFT_RADIUS,
  SOFT_SHADOW,
  linearGradient,
  resolveBackground,
  resolveColor,
  textGradientStyle,
  type SoftButtonColor,
  type SoftColor,
  type SoftFontWeight,
  type SoftRadius,
  type SoftShadow,
  type SoftTextColor,
  type SoftVariant,
} from "@/lib/soft-ui";

/* ------------------------------------------------------------------ */
/* SoftBox                                                             */
/* defaults: variant contained · bgColor transparent · color dark      */
/*           opacity 1 · borderRadius none · shadow none               */
/* ------------------------------------------------------------------ */

export interface SoftBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SoftVariant;
  bgColor?: string;
  color?: string;
  opacity?: number;
  borderRadius?: SoftRadius | string;
  shadow?: SoftShadow | string;
  as?: React.ElementType;
  children?: React.ReactNode;
}

export function SoftBox({
  variant = "contained",
  bgColor = "transparent",
  color = "dark",
  opacity = 1,
  borderRadius = "none",
  shadow = "none",
  as: Tag = "div",
  style,
  className,
  children,
  ...rest
}: SoftBoxProps) {
  const resolved: React.CSSProperties = {
    opacity,
    background: resolveBackground(variant, bgColor),
    color: resolveColor(color),
    borderRadius: SOFT_RADIUS[borderRadius as string] ?? borderRadius,
    boxShadow: SOFT_SHADOW[shadow as string] ?? shadow,
    ...style,
  };

  return (
    <Tag className={className} style={resolved} {...rest}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* SoftTypography                                                      */
/* defaults: color dark · fontWeight false · textTransform none        */
/*           verticalAlign unset · textGradient false · opacity 1      */
/* ------------------------------------------------------------------ */

export interface SoftTypographyProps extends React.HTMLAttributes<HTMLElement> {
  color?: SoftTextColor;
  fontWeight?: SoftFontWeight;
  textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
  verticalAlign?: string;
  textGradient?: boolean;
  opacity?: number;
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "button" | "caption" | "overline";
  as?: React.ElementType;
  children: React.ReactNode;
}

const VARIANT_STYLE: Record<string, React.CSSProperties> = {
  h1: { fontSize: "var(--dp-h1)", lineHeight: 1.25, fontWeight: 500 },
  h2: { fontSize: "var(--dp-h2)", lineHeight: 1.3, fontWeight: 500 },
  h3: { fontSize: "var(--dp-h3)", lineHeight: 1.375, fontWeight: 500 },
  h4: { fontSize: "var(--dp-h4)", lineHeight: 1.375, fontWeight: 500 },
  h5: { fontSize: "var(--dp-h5)", lineHeight: 1.375, fontWeight: 500 },
  h6: { fontSize: "var(--dp-h6)", lineHeight: 1.625, fontWeight: 500 },
  body: { fontSize: "var(--dp-size-body)", lineHeight: 1.6, fontWeight: 400 },
  button: { fontSize: "var(--dp-size-xs)", lineHeight: 1.5, fontWeight: 700 },
  caption: { fontSize: "var(--dp-size-xxs)", lineHeight: 1.25, fontWeight: 400 },
  overline: { fontSize: "var(--dp-size-xxs)", lineHeight: 1.25, fontWeight: 500 },
};

export function SoftTypography({
  color = "dark",
  fontWeight = false,
  textTransform = "none",
  verticalAlign = "unset",
  textGradient = false,
  opacity = 1,
  variant = "body",
  as,
  style,
  className,
  children,
  ...rest
}: SoftTypographyProps) {
  const isHeading = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(variant);
  const Tag: React.ElementType = as ?? (isHeading ? (variant as "h1") : "p");

  const resolved: React.CSSProperties = {
    ...VARIANT_STYLE[variant],
    opacity,
    textTransform,
    verticalAlign,
    color: color === "inherit" ? "inherit" : resolveColor(color),
    ...(fontWeight ? { fontWeight: SOFT_FONT_WEIGHT[fontWeight] } : {}),
    ...(textGradient && color !== "inherit" && color !== "text" && color !== "white"
      ? textGradientStyle(color as SoftColor)
      : {}),
    ...style,
  };

  return (
    <Tag className={className} style={resolved} {...rest}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* SoftButton                                                          */
/* defaults: size medium · variant contained · color white             */
/*           circular false · iconOnly false                           */
/* theme/components/button: radius md(8px), font 12px,                 */
/*   small 32/8·32/12 · medium 40/12·24 · large 47/14·64/14            */
/* ------------------------------------------------------------------ */

export interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "small" | "medium" | "large";
  variant?: "text" | "contained" | "outlined" | "gradient";
  color?: SoftButtonColor;
  circular?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
  as?: React.ElementType;
  href?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

export function SoftButton({
  size = "medium",
  variant = "contained",
  color = "white",
  circular = false,
  iconOnly = false,
  fullWidth = false,
  as: Tag = "button",
  style,
  className,
  children,
  ...rest
}: SoftButtonProps) {
  const palette = SOFT_COLORS[color as keyof typeof SOFT_COLORS] ?? SOFT_COLORS.white;
  const gradient = SOFT_GRADIENTS[color as SoftColor];

  const resolved: React.CSSProperties = { ...style };

  if (variant === "gradient" && gradient) {
    resolved.background = linearGradient(gradient.main, gradient.state);
    resolved.color = "#ffffff";
    resolved.border = "none";
  } else if (variant === "contained") {
    resolved.background = palette;
    resolved.color = color === "white" || color === "light" ? SOFT_COLORS.dark : "#ffffff";
    resolved.border = "none";
  } else if (variant === "outlined") {
    resolved.background = "transparent";
    resolved.color = palette;
    resolved.border = `1px solid ${palette}`;
  } else {
    resolved.background = "transparent";
    resolved.color = palette;
    resolved.border = "none";
  }

  if (circular) resolved.borderRadius = "1.5rem";
  if (fullWidth) resolved.width = "100%";

  return (
    <Tag
      className={clsx(
        styles.button,
        styles[`btn_${size}`],
        iconOnly && styles.btn_iconOnly,
        variant !== "text" && styles.btn_shadow,
        className
      )}
      style={resolved}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* SoftBadge                                                           */
/* defaults: color info · variant gradient · size sm · circular false  */
/* ------------------------------------------------------------------ */

export interface SoftBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: SoftColor;
  variant?: SoftVariant;
  size?: "xs" | "sm" | "md" | "lg";
  circular?: boolean;
  border?: boolean;
  children?: React.ReactNode;
}

export function SoftBadge({
  color = "info",
  variant = "gradient",
  size = "sm",
  circular = false,
  border = false,
  style,
  className,
  children,
  ...rest
}: SoftBadgeProps) {
  const g = SOFT_GRADIENTS[color];
  const b = SOFT_BADGE[color];

  const resolved: React.CSSProperties =
    variant === "gradient"
      ? { background: linearGradient(g.main, g.state), color: "#ffffff" }
      : { background: b.background, color: b.text };

  if (border) resolved.border = `1px solid ${b.text}`;
  resolved.borderRadius = circular ? "0.46875rem" : "var(--dp-radius-md)";

  return (
    <span
      className={clsx(styles.badge, styles[`badge_${size}`], className)}
      style={{ ...resolved, ...style }}
      {...rest}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* SoftAlert — defaults: color info · dismissible false                */
/* ------------------------------------------------------------------ */

export interface SoftAlertProps {
  color?: SoftColor;
  dismissible?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SoftAlert({
  color = "info",
  dismissible = false,
  className,
  children,
}: SoftAlertProps) {
  const [open, setOpen] = React.useState(true);
  const a = SOFT_ALERT[color];
  if (!open) return null;

  return (
    <div
      role="alert"
      className={clsx(styles.alert, className)}
      style={{ background: linearGradient(a.main, a.state) }}
    >
      <div className={styles.alertContent}>{children}</div>
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss alert"
          className={styles.alertClose}
          onClick={() => setOpen(false)}
        >
          &times;
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SoftInput                                                           */
/* defaults: size medium · icon {component:false, direction:"none"}    */
/*           error false · success false · disabled false              */
/* theme/form/inputBase: padding 8px 12px, 14px, radius md, 150ms      */
/* ------------------------------------------------------------------ */

export interface SoftInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "small" | "medium" | "large";
  icon?: { component: React.ReactNode | false; direction: "none" | "left" | "right" };
  error?: boolean;
  success?: boolean;
}

export const SoftInput = React.forwardRef<HTMLInputElement, SoftInputProps>(function SoftInput(
  {
    inputSize = "medium",
    icon = { component: false, direction: "none" },
    error = false,
    success = false,
    className,
    ...rest
  },
  ref
) {
  const hasIcon = Boolean(icon.component) && icon.direction !== "none";

  const field = (
    <input
      ref={ref}
      className={clsx(
        styles.input,
        styles[`input_${inputSize}`],
        error && styles.input_error,
        success && styles.input_success,
        hasIcon && (icon.direction === "left" ? styles.input_padLeft : styles.input_padRight),
        className
      )}
      {...rest}
    />
  );

  if (!hasIcon) return field;

  return (
    <span className={styles.inputWrap}>
      <span
        className={clsx(
          styles.inputIcon,
          icon.direction === "left" ? styles.inputIconLeft : styles.inputIconRight
        )}
        aria-hidden="true"
      >
        {icon.component}
      </span>
      {field}
    </span>
  );
});

/* Textarea & select kept visually identical to SoftInput */
export const SoftTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(function SoftTextarea({ className, error, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={clsx(styles.input, styles.textarea, error && styles.input_error, className)}
      {...rest}
    />
  );
});

export const SoftSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }
>(function SoftSelect({ className, error, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={clsx(styles.input, styles.select, error && styles.input_error, className)}
      {...rest}
    >
      {children}
    </select>
  );
});

/* ------------------------------------------------------------------ */
/* SoftProgress — defaults: variant contained · color info · value 0   */
/* ------------------------------------------------------------------ */

export interface SoftProgressProps {
  variant?: SoftVariant;
  color?: SoftColor;
  value?: number;
  label?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function SoftProgress({
  variant = "contained",
  color = "info",
  value = 0,
  label = false,
  className,
  ariaLabel,
}: SoftProgressProps) {
  const g = SOFT_GRADIENTS[color];
  const clamped = Math.max(0, Math.min(100, value));
  const background =
    variant === "gradient" ? linearGradient(g.main, g.state) : SOFT_COLORS[color];

  return (
    <div className={className}>
      {label && (
        <span className={styles.progressLabel}>{clamped}%</span>
      )}
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel ?? "Progress"}
      >
        <div className={styles.progressBar} style={{ width: `${clamped}%`, background }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SoftAvatar — defaults: bgColor transparent · size md · shadow none  */
/* ------------------------------------------------------------------ */

export interface SoftAvatarProps {
  src?: string;
  alt: string;
  bgColor?: SoftColor | "transparent";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  shadow?: SoftShadow;
  initials?: string;
  className?: string;
}

const AVATAR_SIZE: Record<string, number> = {
  xs: 24,
  sm: 36,
  md: 48,
  lg: 58,
  xl: 74,
  xxl: 110,
};

export function SoftAvatar({
  src,
  alt,
  bgColor = "transparent",
  size = "md",
  shadow = "none",
  initials,
  className,
}: SoftAvatarProps) {
  const px = AVATAR_SIZE[size];
  const g = SOFT_GRADIENTS[bgColor as SoftColor];

  return (
    <span
      className={clsx(styles.avatar, className)}
      style={{
        width: px,
        height: px,
        fontSize: px / 2.6,
        background: g ? linearGradient(g.main, g.state) : "transparent",
        boxShadow: SOFT_SHADOW[shadow],
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} width={px} height={px} />
      ) : (
        <span aria-label={alt}>{initials}</span>
      )}
    </span>
  );
}
