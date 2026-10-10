"use client";

/**
 * 内容类控件：Text / Image / Camera / MapView / Divider / Carousel。
 * 样式与几何移植自 m3e-canvas `M3Node.tsx`、`components/Pickers.tsx`（CarouselBody）
 * 与 `lib/tokens.ts` 的 carousel* 几何函数。
 */

import { useRef, useState, type CSSProperties } from "react";
import { Icon } from "./Icon";
import { useMd3e, useWeight } from "./theme";
import { CARD_GAP, ColorToken, CONTENT_W, PHONE_MARGIN, PHONE_W, scaleR } from "./tokens";

/* ---------- Text ---------- */

export type TextProps = {
  children?: string;
  /** 字号，对应 M3 的 type scale（16 / 22 / 28 / 45 …） */
  size?: number;
  bold?: boolean;
  style?: CSSProperties;
  className?: string;
};

/** 一行文字 */
export function Text({ children, size = 28, bold, style, className }: TextProps) {
  const { palette } = useMd3e();
  const w = useWeight();
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        fontSize: size,
        lineHeight: 1.3,
        fontWeight: bold ? w(700, 800) : w(400, size >= 22 ? 600 : 500),
        letterSpacing: size >= 28 ? -0.25 : 0,
        color: palette.onSurface,
        whiteSpace: "nowrap",
        padding: "0 2px",
        ...style,
      }}
    >
      {children ?? " "}
    </span>
  );
}

/* ---------- Image ---------- */

export type ImageViewProps = {
  src?: string;
  /** 没有图片时的占位图标 */
  placeholderIcon?: string;
  /** 长边尺寸；没给 height 时是正方形 */
  size?: number;
  width?: number;
  height?: number;
  radius?: number;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
};

/** 图片（或占位符） */
export function ImageView({
  src,
  placeholderIcon = "image",
  size = 200,
  width,
  height,
  radius = 20,
  onClick,
  style,
  className,
}: ImageViewProps) {
  const { palette } = useMd3e();
  const w = width ?? size;
  const h = height ?? size;
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: w,
        height: h,
        background: palette.surfaceContainerHighest,
        borderRadius: scaleR(radius),
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        color: palette.outline,
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {src ? (
        <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <Icon name={placeholderIcon} size={Math.min(48, Math.round(Math.min(w, h) * 0.3))} />
      )}
    </div>
  );
}

/* ---------- Camera ---------- */

export type CameraViewProps = {
  icon?: string;
  width?: number;
  height?: number;
  radius?: number;
  style?: CSSProperties;
  className?: string;
};

/** 相机取景器：暗底 + 四角对焦框 + 快门键 */
export function CameraView({
  icon = "photo_camera",
  width = CONTENT_W,
  height = Math.round((CONTENT_W * 4) / 3),
  radius = 20,
  style,
  className,
}: CameraViewProps) {
  const { palette } = useMd3e();
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width,
        height,
        color: palette.inverseOnSurface,
        background: palette.inverseSurface,
        borderRadius: scaleR(radius),
        overflow: "hidden",
        ...style,
      }}
    >
      {(["left", "right"] as const).map((side) =>
        (["top", "bottom"] as const).map((edge) => (
          <div
            key={`${side}-${edge}`}
            style={{
              position: "absolute",
              [side]: 24,
              [edge]: 24,
              width: 28,
              height: 28,
              opacity: 0.7,
              [`border${side === "left" ? "Left" : "Right"}`]: `3px solid ${palette.inverseOnSurface}`,
              [`border${edge === "top" ? "Top" : "Bottom"}`]: `3px solid ${palette.inverseOnSurface}`,
              [`border${edge === "top" ? "Top" : "Bottom"}${side === "left" ? "Left" : "Right"}Radius`]: 6,
            } as CSSProperties}
          />
        )),
      )}
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: 0.5 }}>
        <Icon name={icon} size={40} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 20, display: "grid", placeItems: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            border: `4px solid ${palette.inverseOnSurface}`,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 24, background: palette.inverseOnSurface }} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Map ---------- */

export type MapViewProps = {
  width?: number;
  height?: number;
  radius?: number;
  style?: CSSProperties;
  className?: string;
};

/** 风格化地图：浅底街区 + 两条主路 + 一条河 + 一个定位针 */
export function MapView({
  width = CONTENT_W,
  height = Math.round((CONTENT_W * 3) / 4),
  radius = 20,
  style,
  className,
}: MapViewProps) {
  const { palette } = useMd3e();
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        background: palette.surfaceContainerLow,
        borderRadius: scaleR(radius),
        ...style,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <rect width="400" height="300" fill={palette.surfaceContainerLow} />
        <path
          d="M-20 210 C 80 170, 140 260, 240 220 S 380 150, 430 190 L 430 240 C 380 200, 300 260, 240 250 S 120 230, -20 250 Z"
          fill={palette.primaryContainer}
          opacity={0.6}
        />
        {[
          [20, 20, 90, 60],
          [130, 20, 110, 60],
          [260, 20, 120, 60],
          [20, 100, 90, 70],
          [130, 100, 60, 70],
          [210, 100, 170, 70],
          [20, 190, 60, 40],
          [300, 200, 80, 30],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx={6} fill={palette.surfaceContainerHighest} />
        ))}
        <path d="M0 90 H400 M110 0 V300 M250 0 V300" stroke={palette.surface} strokeWidth={10} fill="none" />
        <path d="M0 90 H400 M110 0 V300 M250 0 V300" stroke={palette.outlineVariant} strokeWidth={1} fill="none" opacity={0.6} />
        <g transform="translate(200 150)">
          <path d="M0 24 C -14 6, -20 -2, -20 -12 A 20 20 0 0 1 20 -12 C 20 -2, 14 6, 0 24 Z" fill={palette.primary} />
          <circle cx="0" cy="-12" r="7" fill={palette.onPrimary} />
        </g>
      </svg>
    </div>
  );
}

/* ---------- Divider ---------- */

export type DividerProps = {
  width?: number;
  /** 是否用更细的 outlineVariant 颜色 */
  style?: CSSProperties;
  className?: string;
};

/** 分隔线 */
export function Divider({ width = CONTENT_W, style, className }: DividerProps) {
  const { palette } = useMd3e();
  return (
    <div className={className} style={{ width, height: 16, display: "flex", alignItems: "center", ...style }}>
      <div style={{ width: "100%", height: 1, background: palette.outlineVariant }} />
    </div>
  );
}

/* ---------- Carousel ---------- */

export type CarouselLayout = "multiBrowse" | "uncontained" | "hero" | "fullScreen";
export type CarouselCard = { label?: string; src?: string; icon?: string };

export type CarouselProps = {
  cards: CarouselCard[];
  layout?: CarouselLayout;
  width?: number;
  height?: number;
  /** 受控的滚动位置（px） */
  scroll?: number;
  onScroll?: (scroll: number) => void;
  onClickCard?: (index: number) => void;
  style?: CSSProperties;
  className?: string;
};

/** 某个布局下每张卡片的基准宽度 */
export function cardWidths(layout: CarouselLayout, width: number, count: number): number[] {
  const small = Math.max(24, Math.round(width * 0.14));
  const large = Math.round(width * 0.56);
  const medium = Math.round(width * 0.3);
  if (layout === "fullScreen") return Array(count).fill(Math.round(width * 0.86));
  if (layout === "hero") return [Math.round(width * 0.72), ...Array(Math.max(0, count - 1)).fill(small)];
  if (layout === "uncontained") return Array(count).fill(Math.max(40, Math.round(width / 2.4)));
  return [large, medium, ...Array(Math.max(0, count - 2)).fill(small)];
}

/** 每张卡片在某位置上的宽度：落在停靠点上是它自己的宽度，其间按两个宽度插值 */
function slotWidth(ws: number[], at: number): number {
  if (at <= -1) return 0;
  if (at < 0) {
    const last = ws[ws.length - 1];
    return last + (ws[0] - last) * (at + 1);
  }
  const k = Math.floor(at);
  const a = ws[Math.min(k, ws.length - 1)];
  const b = ws[Math.min(k + 1, ws.length - 1)];
  return a + (b - a) * (at - k);
}

/** 滚动时每张卡片的位置、宽度，以及它有多少「主卡」的分量 */
export function carouselShapes(ws: number[], scroll: number, stride: number, inset: number, width: number) {
  const count = ws.length;
  const passed = stride > 0 ? scroll / stride : 0;
  let x = inset * Math.max(0, Math.min(1, 1 - passed)) - (passed - Math.floor(passed)) * (ws[ws.length - 1] + CARD_GAP);
  const out: { x: number; w: number; lead: number }[] = [];
  for (let i = 0; i < count; i++) {
    const w = slotWidth(ws, i - passed);
    const lead = ws.length > 1 ? Math.max(0, Math.min(1, (w - ws[1]) / Math.max(1, ws[0] - ws[1]))) : 1;
    out.push({ x, w, lead });
    x += w + CARD_GAP * Math.min(1, w / 8);
  }
  void width;
  return out;
}

/** M3 轮播：一行会横向滚动的卡片，四种排布 */
export function Carousel({
  cards,
  layout = "multiBrowse",
  width = PHONE_W,
  height = 180,
  scroll,
  onScroll,
  onClickCard,
  style,
  className,
}: CarouselProps) {
  const { palette } = useMd3e();
  const [innerScroll, setInnerScroll] = useState(0);
  const cur = scroll ?? innerScroll;
  const setScroll = (v: number) => {
    if (scroll === undefined) setInnerScroll(v);
    onScroll?.(v);
  };

  const inset = width >= PHONE_W ? PHONE_MARGIN : 0;
  const ws = cardWidths(layout, width - inset, Math.max(1, cards.length));
  const stride = ws[0] + CARD_GAP;
  const maxScroll = Math.max(0, (cards.length - 1) * stride);
  const shapes = carouselShapes(ws, cur, stride, inset, width);
  const bigW = ws[0];
  const drag = useRef<{ x: number; start: number } | null>(null);

  const stop = Math.round(cur / stride);

  return (
    <div
      className={className}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, start: cur };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const next = Math.max(0, Math.min(maxScroll, drag.current.start - (e.clientX - drag.current.x)));
        setScroll(next);
      }}
      onPointerUp={() => {
        if (!drag.current) return;
        /* 松手吸附到最近的停靠点 */
        const snapped = Math.max(0, Math.min(maxScroll, Math.round(cur / stride) * stride));
        setScroll(snapped);
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        boxSizing: "border-box",
        cursor: "grab",
        touchAction: "pan-y",
        ...style,
      }}
    >
      {shapes.map(({ x, w: cw, lead }, i) => {
        const card = cards[i] ?? {};
        const words = card.label?.trim() ?? "";
        if (cw < 1) return null;
        return (
          <div
            key={i}
            onClick={() => onClickCard?.(i)}
            style={{
              position: "absolute",
              left: x,
              top: 0,
              width: cw,
              height: "100%",
              borderRadius: scaleR(16),
              background: !card.src && i === 0 ? palette.primaryContainer : palette.surfaceContainerHighest,
              color: i === 0 ? palette.onPrimaryContainer : palette.onSurfaceVariant,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              transition: drag.current ? "none" : "left 260ms cubic-bezier(0.2,0,0,1), width 260ms cubic-bezier(0.2,0,0,1)",
            }}
          >
            {card.src ? (
              <img
                src={card.src}
                alt=""
                draggable={false}
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: bigW,
                  maxWidth: "none",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              cw > 56 &&
              !words && <Icon name={card.icon ?? "image"} size={Math.min(32, Math.round(Math.min(cw, height) * 0.28))} />
            )}
            {card.src && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(rgba(0,0,0,0) 40%, rgba(0,0,0,0.65))`,
                  pointerEvents: "none",
                }}
              />
            )}
            {cw > 72 && words && lead > 0 && (
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  bottom: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  whiteSpace: "pre-line",
                  overflow: "hidden",
                  color: card.src ? "#fff" : "inherit",
                  opacity: lead,
                }}
              >
                {words}
              </span>
            )}
          </div>
        );
      })}

      {/* 上一张 / 下一张 */}
      {maxScroll > 0 && (
        <>
          <CarouselNav side="left" hidden={cur <= 0} onClick={() => setScroll(Math.max(0, (stop - 1) * stride))} />
          <CarouselNav side="right" hidden={cur >= maxScroll} onClick={() => setScroll(Math.min(maxScroll, (stop + 1) * stride))} />
        </>
      )}
    </div>
  );
}

function CarouselNav({ side, hidden, onClick }: { side: "left" | "right"; hidden: boolean; onClick: () => void }) {
  const { palette } = useMd3e();
  return (
    <span
      role="button"
      aria-label={side === "left" ? "上一张" : "下一张"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        position: "absolute",
        top: "50%",
        [side]: 8,
        transform: "translateY(-50%)",
        width: 40,
        height: 40,
        borderRadius: 20,
        display: "grid",
        placeItems: "center",
        background: palette.surfaceContainerHighest,
        color: palette.onSurface,
        boxShadow: "0 1px 4px rgba(0,0,0,0.16)",
        cursor: "pointer",
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
        transition: "opacity 160ms",
      } as CSSProperties}
    >
      <Icon name={side === "left" ? "chevron_left" : "chevron_right"} size={22} />
    </span>
  );
}

export type { ColorToken };
