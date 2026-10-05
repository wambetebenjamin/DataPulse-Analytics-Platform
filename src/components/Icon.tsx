/**
 * Lucide icon registry.
 *
 * Brief: "Icons: Lucide only. No decorative stars, diamonds, or sparkle glyphs."
 * The design source zip shipped MUI Material Icons (webfont ligatures) plus 9
 * hand-rolled SVGs — all replaced here (DESIGN-SOURCE-AUDIT.md §6, §16).
 *
 * Static imports keep tree-shaking intact; a string registry keeps the data
 * modules free of JSX.
 */

import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  BedDouble,
  Bell,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Database,
  Download,
  FileBarChart,
  GraduationCap,
  HandHeart,
  Info,
  LayoutDashboard,
  LineChart,
  Mail,
  MessageCircle,
  Package,
  Scale,
  Settings,
  Shield,
  ShoppingCart,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  // analytics
  "bar-chart-2": BarChart2,
  "line-chart": LineChart,
  "trending-up": TrendingUp,
  "file-bar-chart": FileBarChart,
  "layout-dashboard": LayoutDashboard,
  // operations
  bell: Bell,
  users: Users,
  "user-check": UserCheck,
  shield: Shield,
  database: Database,
  download: Download,
  mail: Mail,
  "message-circle": MessageCircle,
  settings: Settings,
  zap: Zap,
  package: Package,
  "clipboard-list": ClipboardList,
  // industries
  "shopping-cart": ShoppingCart,
  "bed-double": BedDouble,
  "graduation-cap": GraduationCap,
  "hand-heart": HandHeart,
  stethoscope: Stethoscope,
  utensils: Utensils,
  scale: Scale,
  "building-2": Building2,
  // utility
  "arrow-right": ArrowRight,
  "calendar-check": CalendarCheck,
  "check-circle": CheckCircle2,
  "alert-triangle": AlertTriangle,
  info: Info,
};

export default function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  className,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const Cmp = ICONS[name] ?? BarChart2;
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
