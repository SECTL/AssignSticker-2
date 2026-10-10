"use client";

/**
 * 容器类控件：Card / ListItem / Box / BottomSheet / Dialog / Snackbar。
 * 样式移植自 m3e-canvas `M3Node.tsx` 的 card / listItem / dialog / snackbar 分支
 * 与 `boxStyle()`。
 */

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./Icon";
import { useMd3e, useWeight } from "./theme";
import { isLightColor } from "./color";
import { useRipples, RippleProvider, RippleShape } from "./Ripple";
import {
  CARD_MEDIA_GAP,
  CARD_PADDING,
  CARD_SIDE_IMAGE_W,
  CARD_TEXT_GAP,
  ColorToken,
  CONTENT_W,
  ellipsis,
  onToken,
  Palette,
  scaleR,
  Variant,
} from "./tokens";

/* ---------- Box / Bottom Sheet ---------- */

export type BoxProps = {
  children?: ReactNode;
  /** 底色角色 */
  fill?: ColorToken;
  width?: number;
  height?: number;
  radius?: number;
  /** 分别指定四角 */
  radii?: { tl: number; tr: number; bl: number; br: number };
  style?: CSSProperties;
  className?: string;
};

/** 空白容器：一块按调色板上色的面板 */
export function Box({ children, fill = "surfaceContainerHigh", width = CONTENT_W, height = 220, radius, radii, style, className }: BoxProps) {
  const { palette } = useMd3e();
  const r = radius === undefined ? 28 : radius;
  const corners = radii ?? { tl: r, tr: r, bl: r, br: r };
  return (
    <div
      className={className}
      style={{
        width,
        height,
        background: palette[fill],
        color: onToken(fill, palette),
        borderTopLeftRadius: scaleR(corners.tl),
        borderTopRightRadius: scaleR(corners.tr),
        borderBottomLeftRadius: scaleR(corners.bl),
        borderBottomRightRadius: scaleR(corners.br),
        boxSizing: "border-box",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export type BottomSheetProps = {
  children?: ReactNode;
  width?: number;
  height?: number;
  /** 顶部圆角 */
  radius?: number;
  style?: CSSProperties;
  className?: string;
};

/** 底部抽屉：顶部有拖拽把手，只有上边缘是圆的 */
export function BottomSheet({ children, width = CONTENT_W, height = 320, radius = 28, style, className }: BottomSheetProps) {
  const { palette } = useMd3e();
  return (
    <div
      className={className}
      style={{
        width,
        height,
        background: palette.surfaceContainerLow,
        color: palette.onSurface,
        borderTopLeftRadius: scaleR(radius),
        borderTopRightRadius: scaleR(radius),
        boxSizing: "border-box",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 -1px 8px rgba(0,0,0,0.10)",
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 16 }}>
        <div style={{ width: 32, height: 4, borderRadius: 2, background: palette.onSurfaceVariant, opacity: 0.4 }} />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

/* ---------- Card ---------- */

export type CardImagePos = "top" | "bottom" | "leading" | "trailing" | "background";
export type CardAlign = "start" | "center" | "end";

export type CardProps = {
  title?: string;
  supportingText?: string;
  /** 图片地址；没有时用 icon 占位 */
  src?: string;
  icon?: string;
  /** 不显示图片区 */
  noImage?: boolean;
  imagePos?: CardImagePos;
  /** 图片区尺寸：上下为高度、左右为宽度；background 时铺满 */
  imageSize?: number;
  contentAlign?: CardAlign;
  textAlign?: CardAlign;
  variant?: Variant;
  fill?: ColorToken;
  width?: number;
  height?: number;
  actions?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: CSSProperties;
  className?: string;
};

const cardDefaultFill = (v: Variant): ColorToken =>
  v === "outlined" ? "surface" : v === "elevated" ? "surfaceContainerLow" : "surfaceContainerHighest";

/** 卡片内的文字颜色 */
function textColors(p: Palette, props: CardProps) {
  const bgPos = props.imagePos ?? "top";
  const overImage = !props.noImage && bgPos === "background";
  const headline = overImage ? (props.src ? "#ffffff" : p.onPrimaryContainer) : props.fill ? onToken(props.fill, p) : p.onSurface;
  const plain = !props.fill && !overImage;
  const body = plain ? { color: p.onSurfaceVariant, opacity: 1 } : { color: headline, opacity: 0.8 };
  return { headline, body };
}

/** 图片上文字下方的渐隐遮罩，保证可读 */
function scrimOf(ink: string, align: CardAlign) {
  const dark = isLightColor(ink);
  const c = dark ? "0,0,0" : "255,255,255";
  const a = dark ? 0.65 : 0.72;
  if (align === "start") return `linear-gradient(rgba(${c},${a}), rgba(${c},0) 60%)`;
  if (align === "center") return `rgba(${c},${a * 0.65})`;
  return `linear-gradient(rgba(${c},0) 40%, rgba(${c},${a}))`;
}

/** M3 卡片：媒体区 + 标题 + 正文，位置四选一或铺满 */
export function Card({
  title,
  supportingText,
  src,
  icon,
  noImage,
  imagePos = "top",
  imageSize,
  contentAlign,
  textAlign = "start",
  variant = "tonal",
  fill,
  width = CONTENT_W,
  height = 223,
  actions,
  onClick,
  style,
  className,
}: CardProps) {
  const { palette } = useMd3e();
  const w = useWeight();
  const bg = fill ?? cardDefaultFill(variant);
  const { headline, body } = textColors(palette, { noImage, imagePos, src, fill });
  const hasImage = !noImage;
  const align = contentAlign ?? (!noImage && imagePos === "background" ? "end" : "start");
  const justifyContent = { start: "flex-start", center: "center", end: "flex-end" }[align] as CSSProperties["justifyContent"];
  const alignItems = { start: "flex-start", center: "center", end: "flex-end" }[textAlign] as CSSProperties["alignItems"];
  const ta = { start: "start", center: "center", end: "end" }[textAlign] as CSSProperties["textAlign"];

  const band = imagePos === "top" || imagePos === "bottom";
  const maxImage = Math.max(40, (band ? height - 48 : width - 96) - CARD_PADDING * 2 - CARD_MEDIA_GAP);
  const imgExtent = Math.min(imageSize ?? (band ? Math.round(width * 0.28) : CARD_SIDE_IMAGE_W), maxImage);

  const picture = src ? (
    <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
  ) : icon ? (
    <Icon name={icon} size={34} />
  ) : null;

  const text = (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: CARD_TEXT_GAP,
        justifyContent,
        alignItems,
        textAlign: ta,
      }}
    >
      {title?.trim() && (
        <div style={{ fontSize: 16, fontWeight: w(600, 700), color: headline, maxWidth: "100%", ...ellipsis }}>{title}</div>
      )}
      {supportingText?.trim() && (
        <div style={{ fontSize: 13, lineHeight: 1.5, color: body.color, opacity: body.opacity, overflow: "hidden" }}>{supportingText}</div>
      )}
    </div>
  );

  const frame: CSSProperties = {
    width,
    height,
    background: palette[bg],
    border: variant === "outlined" ? `1px solid ${palette.outlineVariant}` : "none",
    borderRadius: scaleR(20),
    boxShadow: variant === "elevated" ? "0 1px 3px rgba(0,0,0,0.20), 0 2px 6px rgba(0,0,0,0.10)" : undefined,
    boxSizing: "border-box",
    overflow: "hidden",
    cursor: onClick ? "pointer" : undefined,
  };

  if (hasImage && imagePos === "background") {
    const scrim = src || fill ? scrimOf(headline, align) : undefined;
    return (
      <div className={className} onClick={onClick} style={{ ...frame, position: "relative", ...style }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: palette.primaryContainer,
            color: palette.onPrimaryContainer,
            display: "grid",
            placeItems: "center",
          }}
        >
          {picture}
        </div>
        {scrim && <div style={{ position: "absolute", inset: 0, background: scrim }} />}
        <div style={{ position: "relative", height: "100%", boxSizing: "border-box", padding: CARD_PADDING, display: "flex", flexDirection: "column" }}>
          {text}
          {actions}
        </div>
      </div>
    );
  }

  const side = hasImage && (imagePos === "leading" || imagePos === "trailing");
  const after = imagePos === "trailing" || imagePos === "bottom";
  const media = (
    <div
      style={{
        borderRadius: scaleR(14),
        background: palette.primaryContainer,
        color: palette.onPrimaryContainer,
        display: "grid",
        placeItems: "center",
        flex: "0 0 auto",
        overflow: "hidden",
        ...(side ? { width: imgExtent, alignSelf: "stretch" } : { height: imgExtent }),
      }}
    >
      {picture}
    </div>
  );

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...frame,
        padding: CARD_PADDING,
        display: "flex",
        flexDirection: side ? "row" : "column",
        gap: CARD_MEDIA_GAP,
        ...style,
      }}
    >
      {hasImage && !after && media}
      {text}
      {actions}
      {hasImage && after && media}
    </div>
  );
}

/* ---------- List Item ---------- */

export type ListItemProps = {
  label: string;
  supportingText?: string;
  /** 前置图标 */
  icon?: string;
  /** 尾部图标 */
  icon2?: string;
  /** 尾部放一个开关而不是图标 */
  trailingSwitch?: boolean;
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  /** 行底色 */
  fill?: ColorToken;
  /** 前置图标圆底的底色；"none" 表示不画圆底 */
  iconFill?: ColorToken | "none";
  width?: number;
  height?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: CSSProperties;
  className?: string;
};

/** M3 列表项 */
export function ListItem({
  label,
  supportingText,
  icon,
  icon2 = "chevron_right",
  trailingSwitch,
  checked,
  onCheckedChange,
  fill = "surfaceContainerLow",
  iconFill = "primaryContainer",
  width = CONTENT_W,
  height = 72,
  onClick,
  style,
  className,
}: ListItemProps) {
  const { palette } = useMd3e();
  const disc = iconFill === "none" ? null : iconFill;
  const ripples = useRipples(!!onClick);
  const ink = palette.onSurface;
  return (
    <div
      className={className}
      onClick={onClick}
      onPointerDown={ripples.add}
      onPointerCancel={ripples.end}
      onPointerUp={ripples.end}
      onPointerLeave={ripples.end}
      style={{
        width,
        height,
        background: palette[fill],
        color: onToken(fill, palette),
        borderRadius: scaleR(28),
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 16px",
        boxSizing: "border-box",
        cursor: onClick ? "pointer" : undefined,
        position: "relative",
        overflow: "hidden",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      <RippleProvider list={ripples.list} color={ink}>
        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              background: disc ? palette[disc] : "transparent",
              color: disc ? onToken(disc, palette) : onToken(fill, palette),
              display: "grid",
              placeItems: "center",
              flex: "0 0 auto",
            }}
          >
            <Icon name={icon} size={22} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {label?.trim() && <div style={{ fontSize: 16, color: palette.onSurface, ...ellipsis }}>{label}</div>}
          {supportingText?.trim() && (
            <div style={{ fontSize: 13, color: palette.onSurfaceVariant, ...ellipsis }}>{supportingText}</div>
          )}
        </div>
        {trailingSwitch ? (
          <MiniSwitch on={!!checked} onChange={onCheckedChange} />
        ) : (
          icon2 && <Icon name={icon2} size={22} color={palette.onSurfaceVariant} />
        )}
        <RippleShape part={null} />
      </RippleProvider>
    </div>
  );
}

/** 列表项里的迷你开关（避免与 Choice.tsx 循环依赖，这里单独画一个） */
function MiniSwitch({ on, onChange }: { on: boolean; onChange?: (v: boolean) => void }) {
  const { palette } = useMd3e();
  return (
    <span
      role="switch"
      tabIndex={0}
      aria-checked={on}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(!on);
      }}
      style={{
        position: "relative",
        width: 52,
        height: 32,
        borderRadius: 16,
        background: on ? palette.primary : palette.surfaceContainerHighest,
        border: on ? "2px solid transparent" : `2px solid ${palette.outline}`,
        boxSizing: "border-box",
        flex: "0 0 auto",
        cursor: "pointer",
        transition: "background 160ms",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: on ? 22 : 4,
          width: on ? 24 : 16,
          height: on ? 24 : 16,
          marginTop: on ? -12 : -8,
          borderRadius: 12,
          background: on ? palette.onPrimary : palette.outline,
          display: "grid",
          placeItems: "center",
          color: palette.onPrimaryContainer,
          transition: "left 160ms, width 160ms, height 160ms",
        }}
      >
        {on && <Icon name="check" size={16} weight={600} />}
      </span>
    </span>
  );
}

/* ---------- Dialog ---------- */

export type DialogProps = {
  title?: string;
  supportingText?: string;
  icon?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  width?: number;
  height?: number;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
};

/** M3 对话框 */
export function Dialog({
  title,
  supportingText,
  icon,
  cancelText = "取消",
  confirmText = "确定",
  onCancel,
  onConfirm,
  width = 312,
  height,
  children,
  style,
  className,
}: DialogProps) {
  const { palette } = useMd3e();
  const w = useWeight();
  return (
    <div
      className={className}
      style={{
        width,
        height,
        background: palette.surfaceContainerHigh,
        color: palette.onSurface,
        borderRadius: scaleR(28),
        boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        padding: 24,
        gap: 12,
        ...style,
      }}
    >
      {icon && (
        <div style={{ textAlign: "center", color: palette.primary }}>
          <Icon name={icon} size={24} />
        </div>
      )}
      {title?.trim() && (
        <div style={{ fontSize: 24, fontWeight: w(400, 600), color: palette.onSurface, textAlign: icon ? "center" : "left", ...ellipsis }}>
          {title}
        </div>
      )}
      {supportingText?.trim() && (
        <div style={{ fontSize: 14, lineHeight: 1.5, color: palette.onSurfaceVariant, flex: 1, overflow: "hidden" }}>{supportingText}</div>
      )}
      {children}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "auto" }}>
        <DialogAction label={cancelText} onClick={onCancel} />
        <DialogAction label={confirmText} onClick={onConfirm} />
      </div>
    </div>
  );
}

function DialogAction({ label, onClick }: { label: string; onClick?: () => void }) {
  const { palette } = useMd3e();
  return (
    <span
      className="md3e-text-action"
      onClick={onClick}
      style={{
        padding: "0 12px",
        height: 40,
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 20,
        color: palette.primary,
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {label}
    </span>
  );
}

/* ---------- Snackbar ---------- */

export type SnackbarProps = {
  message: string;
  actionText?: string;
  onAction?: () => void;
  width?: number;
  style?: CSSProperties;
  className?: string;
};

/** M3 消息条 */
export function Snackbar({ message, actionText, onAction, width = 344, style, className }: SnackbarProps) {
  const { palette } = useMd3e();
  return (
    <div
      className={className}
      style={{
        width,
        height: 48,
        background: palette.inverseSurface,
        color: palette.inverseOnSurface,
        borderRadius: scaleR(8),
        boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 8px 0 16px",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, fontSize: 14, ...ellipsis }}>{message}</div>
      {actionText && (
        <span
          className="md3e-text-action"
          onClick={onAction}
          style={{
            padding: "0 12px",
            height: 36,
            display: "inline-flex",
            alignItems: "center",
            borderRadius: 18,
            color: palette.inversePrimary,
            fontSize: 14,
            fontWeight: 500,
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          {actionText}
        </span>
      )}
    </div>
  );
}
