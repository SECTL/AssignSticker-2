/**
 * MD3E 度量与设计令牌。
 * 移植自 m3e-canvas `lib/tokens.ts` —— 只保留控件渲染需要的部分，
 * 去掉画布 / 文档 / 提示词相关的逻辑。
 *
 * 约定：所有数值单位都是 dp（在 Web 上即 px）。
 */

import type { CSSProperties } from "react";
import { Contrast, schemeFromSeed } from "./color";

export type { Contrast };

/* ---------- 几何 ---------- */

/** M3 medium button 高度 */
export const H = 56;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 按钮的五个 M3E 尺寸：高度、左右内边距、图标与文字的间距、图标、字号。
 *  取两个尺寸之间的高度时，各项按比例插值，所以整条刻度上都是 M3 的形状。 */
export const BUTTON_SIZES = [
  { key: "xs", h: 32, padX: 12, gap: 8, icon: 20, font: 14 },
  { key: "s", h: 40, padX: 16, gap: 8, icon: 20, font: 14 },
  { key: "m", h: 56, padX: 24, gap: 8, icon: 24, font: 16 },
  { key: "l", h: 96, padX: 48, gap: 12, icon: 32, font: 24 },
  { key: "xl", h: 136, padX: 64, gap: 16, icon: 40, font: 32 },
] as const;
export type ButtonSizeKey = (typeof BUTTON_SIZES)[number]["key"];
export const BUTTON_H_MIN = BUTTON_SIZES[0].h;
export const BUTTON_H_MAX = BUTTON_SIZES[BUTTON_SIZES.length - 1].h;
export type ButtonMetrics = { h: number; padX: number; gap: number; icon: number; font: number };

function onScale<T extends { h: number }>(steps: readonly T[], height: number) {
  const h = clamp(Math.round(height), steps[0].h, steps[steps.length - 1].h);
  let lo: T = steps[0];
  let hi: T = steps[steps.length - 1];
  for (let i = 0; i < steps.length - 1; i++) {
    if (h >= steps[i].h && h <= steps[i + 1].h) {
      lo = steps[i];
      hi = steps[i + 1];
      break;
    }
  }
  const f = hi.h === lo.h ? 0 : (h - lo.h) / (hi.h - lo.h);
  return { h, of: (read: (s: T) => number) => Math.round(lerp(read(lo), read(hi), f)) };
}

/** 某个高度上的按钮由什么构成 */
export function buttonMetrics(height: number): ButtonMetrics {
  const s = onScale(BUTTON_SIZES, height);
  return { h: s.h, padX: s.of((b) => b.padX), gap: s.of((b) => b.gap), icon: s.of((b) => b.icon), font: s.of((b) => b.font) };
}

/** M3 chip 的三个尺寸；chip 的宽度由文字决定，高度是它唯一的度量。
 *  `lead` 是图标一侧更紧的内边距。 */
export const CHIP_SIZES = [
  { key: "xs", h: 32, padX: 16, lead: 8, gap: 8, icon: 18, font: 14 },
  { key: "s", h: 40, padX: 20, lead: 12, gap: 8, icon: 20, font: 14 },
  { key: "m", h: 56, padX: 24, lead: 16, gap: 8, icon: 24, font: 16 },
] as const;
export type ChipSizeKey = (typeof CHIP_SIZES)[number]["key"];
export const CHIP_H_MIN = CHIP_SIZES[0].h;
export const CHIP_H_MAX = CHIP_SIZES[CHIP_SIZES.length - 1].h;
export type ChipMetrics = { h: number; padX: number; lead: number; gap: number; icon: number; font: number };

export function chipMetrics(height: number): ChipMetrics {
  const s = onScale(CHIP_SIZES, height);
  return {
    h: s.h,
    padX: s.of((c) => c.padX),
    lead: s.of((c) => c.lead),
    gap: s.of((c) => c.gap),
    icon: s.of((c) => c.icon),
    font: s.of((c) => c.font),
  };
}

/** split button 两段之间的发丝缝 */
export const SPLIT_GAP = 2;
export type SplitMetrics = ButtonMetrics & { trailPadX: number; trailW: number };
/** split button 是一分为二的按钮：承载动作的一段，加开菜单的箭头段 */
export function splitMetrics(height: number): SplitMetrics {
  const m = buttonMetrics(height);
  const trailPadX = Math.round(m.padX * 0.6);
  return { ...m, trailPadX, trailW: m.icon + trailPadX * 2 };
}

/** split button 箭头展开的菜单：M3 menu sheet */
export const SPLIT_MENU_ITEM_H = 48;
export const SPLIT_MENU_PAD = 8;
export const SPLIT_MENU_SHEET_GAP = 4;

/** M3 的三个 FAB 尺寸；extended FAB 是同样三个，多给文字留位置 */
export const FAB_SIZES = [
  { key: "s", d: 40, h: 56 },
  { key: "m", d: 56, h: 80 },
  { key: "l", d: 96, h: 96 },
] as const;
export const FAB_H_MIN = 40;
export const FAB_H_MAX = 96;

/** 环形进度 / loading / 进度条的三档尺寸 */
export const RING_SIZES = [
  { key: "s", value: 24 },
  { key: "m", value: 48 },
  { key: "l", value: 64 },
] as const;
export const LOADING_SIZES = [
  { key: "s", value: 32 },
  { key: "m", value: 48 },
  { key: "l", value: 64 },
  { key: "xl", value: 96 },
] as const;

/** 连通组（connected run）间距与外/内圆角 */
export const GAP = 3;
export const R_FULL = 28;
export const R_INNER = 8;

/** 磁吸场：沿 run 方向的半径，与跨 run 方向的半径（dp）。
 *  再给一个 GAP，也还是"自由摆放"，只有落进这个场里才会融合。 */
export const SNAP_MAIN = 44;
export const SNAP_CROSS = 24;
/** 拉力爬升曲线：从场边缘的 0 到落点上的 1，指数越大边缘越平缓 */
export const PULL_EXP = 2.2;
/** 对齐参考线的容差（dp） */
export const GUIDE_PX = 7;

/** settle 时长与曲线：控件尺寸变化时整体缓动 */
export const SETTLE_MS = 340;
export const SETTLE_CSS_VARS = { "--m3-settle": `${SETTLE_MS}ms`, "--m3-ease": "cubic-bezier(0.2, 0, 0, 1)" } as const;

export const PHONE_W = 412;
export const PHONE_H = 892;
export const PHONE_R = 40;
/** system inset：top app bar 上方的状态栏 */
export const STATUS_BAR_H = 24;
/** navigation bar 下方的手势区 */
export const NAV_BAR_H = 24;
/** 不是边到边的部件距离屏幕边缘的留白 */
export const PHONE_MARGIN = 16;
export const contentWidth = (width: number) => width - PHONE_MARGIN * 2;
export const halfWidth = (width: number) => (contentWidth(width) - PHONE_MARGIN) / 2;
export const CONTENT_W = contentWidth(PHONE_W);
export const HALF_W = halfWidth(PHONE_W);
export const WIDTH_PRESETS = [HALF_W, CONTENT_W, PHONE_W];

/** M3 的三种 top app bar */
export const TOP_BAR_SIZES = [
  { key: "s", h: 64, font: 22 },
  { key: "m", h: 112, font: 24 },
  { key: "l", h: 152, font: 28 },
] as const;

/** navigation rail 度量（旧版 80dp rail） */
export const RAIL_W = 80;
export const RAIL_TOP = 44;
export const RAIL_ITEM_H = 52;
export const RAIL_GAP = 12;
/** M3E navigation rail：收起的宽轨与展开的宽 */
export const RAIL_COLLAPSED_W = 96;
export const RAIL_EXPANDED_W = 220;

export type Radii = { tl: number; tr: number; bl: number; br: number };
export const uniformRadii = (r: number): Radii => ({ tl: r, tr: r, bl: r, br: r });

/* ---------- 调色板 ---------- */

export type Palette = {
  key: string;
  label: string;
  /** 自定义配色由哪个颜色生成 */
  seed?: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  inversePrimary: string;
  secondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  surface: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
};

const ERROR = {
  error: "#B3261E",
  onError: "#FFFFFF",
  errorContainer: "#F9DEDC",
  onErrorContainer: "#410E0B",
};

/** 预设配色不写 secondary，由种子色推导 */
const PRESETS: Omit<Palette, "secondary">[] = [
  {
    key: "purple",
    label: "Purple",
    primary: "#6750A4",
    onPrimary: "#FFFFFF",
    primaryContainer: "#EADDFF",
    onPrimaryContainer: "#21005D",
    inversePrimary: "#D0BCFF",
    secondaryContainer: "#E8DEF8",
    onSecondaryContainer: "#1D192B",
    tertiaryContainer: "#FFD8E4",
    onTertiaryContainer: "#31111D",
    surface: "#FEF7FF",
    surfaceContainerLow: "#F7F2FA",
    surfaceContainer: "#F3EDF7",
    surfaceContainerHigh: "#ECE6F0",
    surfaceContainerHighest: "#E6E0E9",
    onSurface: "#1D1B20",
    onSurfaceVariant: "#49454F",
    outline: "#79747E",
    outlineVariant: "#CAC4D0",
    inverseSurface: "#322F35",
    inverseOnSurface: "#F5EFF7",
    ...ERROR,
  },
  {
    key: "blue",
    label: "Blue",
    primary: "#0B57D0",
    onPrimary: "#FFFFFF",
    primaryContainer: "#D3E3FD",
    onPrimaryContainer: "#041E49",
    inversePrimary: "#A8C7FA",
    secondaryContainer: "#DCE2F9",
    onSecondaryContainer: "#131C2B",
    tertiaryContainer: "#FFD8EE",
    onTertiaryContainer: "#2E1125",
    surface: "#FAF9FD",
    surfaceContainerLow: "#F3F3FA",
    surfaceContainer: "#EEEDF3",
    surfaceContainerHigh: "#E9E8EF",
    surfaceContainerHighest: "#E3E2E6",
    onSurface: "#1B1B1F",
    onSurfaceVariant: "#44474E",
    outline: "#74777F",
    outlineVariant: "#C4C6D0",
    inverseSurface: "#303034",
    inverseOnSurface: "#F2F0F4",
    ...ERROR,
  },
  {
    key: "green",
    label: "Green",
    primary: "#2E6A45",
    onPrimary: "#FFFFFF",
    primaryContainer: "#B0F1C2",
    onPrimaryContainer: "#00210F",
    inversePrimary: "#95D5A7",
    secondaryContainer: "#D3E8D8",
    onSecondaryContainer: "#102016",
    tertiaryContainer: "#C2E8FF",
    onTertiaryContainer: "#001E2C",
    surface: "#F6FBF4",
    surfaceContainerLow: "#F0F5EE",
    surfaceContainer: "#EAF0E8",
    surfaceContainerHigh: "#E4EAE2",
    surfaceContainerHighest: "#DEE4DC",
    onSurface: "#181D18",
    onSurfaceVariant: "#414941",
    outline: "#707972",
    outlineVariant: "#BFC9C0",
    inverseSurface: "#2D322D",
    inverseOnSurface: "#EEF2EB",
    ...ERROR,
  },
  {
    key: "coral",
    label: "Coral",
    primary: "#984061",
    onPrimary: "#FFFFFF",
    primaryContainer: "#FFD9E2",
    onPrimaryContainer: "#3E001D",
    inversePrimary: "#FFB0C8",
    secondaryContainer: "#F6DDE4",
    onSecondaryContainer: "#31101D",
    tertiaryContainer: "#FFDBCA",
    onTertiaryContainer: "#2C1600",
    surface: "#FFF8F8",
    surfaceContainerLow: "#FCF0F2",
    surfaceContainer: "#F6EBED",
    surfaceContainerHigh: "#F3E5E9",
    surfaceContainerHighest: "#EEE0E3",
    onSurface: "#201A1B",
    onSurfaceVariant: "#524346",
    outline: "#847377",
    outlineVariant: "#D5C2C6",
    inverseSurface: "#352F30",
    inverseOnSurface: "#FAEEEF",
    ...ERROR,
  },
  {
    key: "amber",
    label: "Amber",
    primary: "#8B5000",
    onPrimary: "#FFFFFF",
    primaryContainer: "#FFDCC2",
    onPrimaryContainer: "#2C1600",
    inversePrimary: "#FFB77C",
    secondaryContainer: "#F6DFC8",
    onSecondaryContainer: "#271905",
    tertiaryContainer: "#D5EDC0",
    onTertiaryContainer: "#0E2004",
    surface: "#FFF8F5",
    surfaceContainerLow: "#FCF1EA",
    surfaceContainer: "#F7ECE4",
    surfaceContainerHigh: "#F3E6DE",
    surfaceContainerHighest: "#EDE0D8",
    onSurface: "#211A14",
    onSurfaceVariant: "#51443B",
    outline: "#83746A",
    outlineVariant: "#D6C3B6",
    inverseSurface: "#362F28",
    inverseOnSurface: "#FBEEE5",
    ...ERROR,
  },
  {
    key: "teal",
    label: "Teal",
    primary: "#00696E",
    onPrimary: "#FFFFFF",
    primaryContainer: "#9CF1F6",
    onPrimaryContainer: "#002022",
    inversePrimary: "#80D5DA",
    secondaryContainer: "#CCE8E9",
    onSecondaryContainer: "#051F20",
    tertiaryContainer: "#D2E4FF",
    onTertiaryContainer: "#001C3B",
    surface: "#F4FBFB",
    surfaceContainerLow: "#EEF5F5",
    surfaceContainer: "#E8EFEF",
    surfaceContainerHigh: "#E2EAEA",
    surfaceContainerHighest: "#DDE4E4",
    onSurface: "#161D1D",
    onSurfaceVariant: "#3F4948",
    outline: "#6F7979",
    outlineVariant: "#BEC8C8",
    inverseSurface: "#2B3232",
    inverseOnSurface: "#ECF2F2",
    ...ERROR,
  },
  {
    key: "mono",
    label: "Mono",
    primary: "#4A4459",
    onPrimary: "#FFFFFF",
    primaryContainer: "#E6E0F0",
    onPrimaryContainer: "#1A1626",
    inversePrimary: "#CFC3E0",
    secondaryContainer: "#E6E1E6",
    onSecondaryContainer: "#1B1B1F",
    tertiaryContainer: "#E9E0EA",
    onTertiaryContainer: "#1E1A22",
    surface: "#FCF8FD",
    surfaceContainerLow: "#F5F1F6",
    surfaceContainer: "#EFEBF0",
    surfaceContainerHigh: "#E9E5EA",
    surfaceContainerHighest: "#E4E0E5",
    onSurface: "#1C1B1F",
    onSurfaceVariant: "#48454E",
    outline: "#79747E",
    outlineVariant: "#CAC4D0",
    inverseSurface: "#313033",
    inverseOnSurface: "#F4EFF4",
    ...ERROR,
  },
];

export const PALETTES: Palette[] = PRESETS.map((p) => ({
  ...p,
  secondary: schemeFromSeed(p.primary, p.label, { keepChroma: true }).secondary,
}));

/* ---------- 主题：M3E 的四个轴 ---------- */

export type ShapeScale = "square" | "rounded" | "full";
export type MotionScheme = "standard" | "expressive";

export type Theme = {
  dark: boolean;
  contrast: Contrast;
  shape: ShapeScale;
  /** 标题与标签使用 M3E 更重的 emphasized 字重 */
  emphasized: boolean;
  motion: MotionScheme;
};

export const DEFAULT_THEME: Theme = {
  dark: false,
  contrast: "standard",
  shape: "rounded",
  emphasized: false,
  motion: "standard",
};

export const SHAPES: { key: ShapeScale; label: string; icon: string }[] = [
  { key: "square", label: "Square", icon: "crop_square" },
  { key: "rounded", label: "Rounded", icon: "rounded_corner" },
  { key: "full", label: "Full", icon: "circle" },
];

export const CONTRASTS: { key: Contrast; label: string }[] = [
  { key: "standard", label: "Standard" },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High" },
];

/** 文档的形状刻度；渲染辅助函数在 React 之外读取它 */
let curShape: ShapeScale = "rounded";
export const setGlobalShape = (s: ShapeScale) => {
  curShape = s;
};
export const getShape = () => curShape;

/** 形状刻度下的圆角 */
export function scaleR(r: number): number {
  if (curShape === "square") return Math.round(r * 0.35);
  if (curShape === "full") return Math.round(r * 1.6);
  return r;
}

/** 当前渲染使用的配色：预设与自定义都是亮色 / 标准对比度；
 *  暗色模式与其他对比度由同一个种子色生成。 */
export function paletteOf(key: string, custom?: Palette | null, theme?: Theme): Palette {
  const base = (key === "custom" && custom) || PALETTES.find((p) => p.key === key) || PALETTES[0];
  if (!theme || (!theme.dark && theme.contrast === "standard")) {
    return base.secondary ? base : { ...base, secondary: schemeFromSeed(base.seed ?? base.primary).secondary };
  }
  const seed = base.seed ?? base.primary;
  return {
    ...schemeFromSeed(seed, base.label, { dark: theme.dark, contrast: theme.contrast, keepChroma: base.key !== "custom" }),
    key: base.key,
  };
}

/* ---------- 对比度角色（variant） ---------- */

export type Variant = "filled" | "tonal" | "elevated" | "outlined" | "text";

export const VARIANTS: { key: Variant; label: string }[] = [
  { key: "filled", label: "Filled" },
  { key: "tonal", label: "Tonal" },
  { key: "elevated", label: "Elevated" },
  { key: "outlined", label: "Outlined" },
  { key: "text", label: "Text" },
];

export function variantStyle(v: Variant, p: Palette): CSSProperties {
  switch (v) {
    case "filled":
      return { background: p.primary, color: p.onPrimary, border: "none" };
    case "tonal":
      return { background: p.secondaryContainer, color: p.onSecondaryContainer, border: "none" };
    case "elevated":
      return { background: p.surfaceContainerLow, color: p.primary, border: "none" };
    case "outlined":
      return { background: "transparent", color: p.primary, border: `1px solid ${p.outline}` };
    case "text":
      return { background: "transparent", color: p.primary, border: "none" };
  }
}

export function variantShadow(v: Variant): string {
  if (v === "elevated") return "0 1px 3px rgba(0,0,0,0.20), 0 4px 8px rgba(0,0,0,0.10)";
  return "none";
}

/* ---------- 度量辅助 ---------- */

/** 按钮被绘制的高度；关闭尺寸与高度一一对应 */
export const buttonHeightOf = (size2?: number, size?: number, kind = "button") =>
  clamp(Math.round(kind === "iconButton" ? (size ?? H) : (size2 ?? H)), BUTTON_H_MIN, BUTTON_H_MAX);

export const chipHeightOf = (size2?: number) => clamp(Math.round(size2 ?? CHIP_H_MIN), CHIP_H_MIN, CHIP_H_MAX);

export const extendedFabHeight = (size2?: number) => clamp(Math.round(size2 ?? 56), 56, FAB_H_MAX);

export function extendedFabMetrics(h: number) {
  const k = (h - 56) / (FAB_H_MAX - 56);
  return {
    h,
    padX: Math.round(lerp(20, 28, k)),
    gap: Math.round(lerp(12, 16, k)),
    icon: Math.round(lerp(24, 32, k)),
    font: Math.round(lerp(14, 20, k)),
    radius: Math.round(lerp(16, 28, k)),
  };
}

/** top app bar 的高度（不含状态栏） */
export const topBarHeightOf = (size2?: number) =>
  clamp(Math.round(size2 ?? TOP_BAR_SIZES[0].h), TOP_BAR_SIZES[0].h, TOP_BAR_SIZES[TOP_BAR_SIZES.length - 1].h);

/** 该高度对应的标题字号：落到某个命名尺寸就用它，否则用最接近的下一个 */
export const topBarFontOf = (size2?: number) => {
  const h = topBarHeightOf(size2);
  let font: number = TOP_BAR_SIZES[0].font;
  for (const b of TOP_BAR_SIZES) if (h >= b.h) font = b.font;
  return font;
};

/** 进度条轨道厚度 */
export const TRACK_MIN = 2;
export const TRACK_MAX = 16;
export const TRACK_DEFAULT = 4;
export const maxRingThickness = (size: number) => Math.max(TRACK_DEFAULT, Math.min(TRACK_MAX, Math.floor(size / 6)));
export const isTrackThickness = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= TRACK_MIN && v <= TRACK_MAX;
export const progressThickness = (v: number | undefined, ringSize?: number): number => {
  const t = isTrackThickness(v) ? v : TRACK_DEFAULT;
  return ringSize === undefined ? t : Math.min(t, maxRingThickness(ringSize));
};

/** 卡片内边距：内容距边 20dp，标题与正文相距 4dp，图片区与文字相距 12dp */
export const CARD_PADDING = 20;
export const CARD_TEXT_GAP = 4;
export const CARD_MEDIA_GAP = 12;
/** 卡片侧边图片列的默认宽度 */
export const CARD_SIDE_IMAGE_W = 80;
export const CARD_IMAGE_MIN = 40;
export const CARD_GAP = 8;

/* ---------- 颜色角色 ---------- */

export type ColorToken =
  | "surface"
  | "surfaceContainerLow"
  | "surfaceContainer"
  | "surfaceContainerHigh"
  | "surfaceContainerHighest"
  | "primaryContainer"
  | "secondaryContainer"
  | "tertiaryContainer"
  | "primary"
  | "inverseSurface";

export const COLOR_TOKENS: { key: ColorToken; label: string }[] = [
  { key: "surface", label: "Surface" },
  { key: "surfaceContainerLow", label: "Container low" },
  { key: "surfaceContainer", label: "Container" },
  { key: "surfaceContainerHigh", label: "Container high" },
  { key: "surfaceContainerHighest", label: "Container highest" },
  { key: "primaryContainer", label: "Primary container" },
  { key: "secondaryContainer", label: "Secondary container" },
  { key: "tertiaryContainer", label: "Tertiary container" },
  { key: "primary", label: "Primary" },
  { key: "inverseSurface", label: "Inverse surface" },
];

export function onToken(t: ColorToken, p: Palette): string {
  switch (t) {
    case "primary":
      return p.onPrimary;
    case "primaryContainer":
      return p.onPrimaryContainer;
    case "secondaryContainer":
      return p.onSecondaryContainer;
    case "tertiaryContainer":
      return p.onTertiaryContainer;
    case "inverseSurface":
      return p.inverseOnSurface;
    default:
      return p.onSurface;
  }
}

/* ---------- 连通组 ---------- */

export type Axis = "x" | "y";
export type ConnectSpec = { axis: Axis; outer: number; inner: number; family: string };

/** 连通组里某一部件的圆角：外圆内小 */
export function runCorners(axis: Axis, first: boolean, last: boolean, outer: number, inner: number): Radii {
  const a = first ? outer : inner;
  const b = last ? outer : inner;
  return axis === "x" ? { tl: a, bl: a, tr: b, br: b } : { tl: a, tr: a, bl: b, br: b };
}

/** 部件被按下时从内部点亮的种类 */
export const RIPPLE_KINDS = ["button", "iconButton", "chip", "fab", "extendedFab", "splitButton"] as const;

/** 省略号截断 */
export const ellipsis: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
