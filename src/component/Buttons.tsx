"use client";

/**
 * 操作类控件：Button / IconButton / FAB / Extended FAB。
 * 样式与度量移植自 m3e-canvas `components/M3Node.tsx` + `lib/tokens.ts`。
 */

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./Icon";
import { Pressable } from "./Pressable";
import { useMd3e, useWeight } from "./theme";
import {
  BUTTON_H_MAX,
  BUTTON_H_MIN,
  buttonMetrics,
  extendedFabHeight,
  extendedFabMetrics,
  FAB_H_MAX,
  FAB_H_MIN,
  Palette,
  Variant,
  scaleR,
} from "./tokens";

/* ---------- Button ---------- */

export type ButtonProps = {
  children?: ReactNode;
  label?: string;
  /** Material Symbols 名称 */
  icon?: string;
  variant?: Variant;
  /** M3 命名尺寸或任意高度（32..136dp） */
  size?: number;
  /** 固定宽度；不设时按内容自适应 */
  width?: number;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  /** 开关型按钮的选中态 */
  selected?: boolean;
  selectedVariant?: Variant;
  fullWidth?: boolean;
  style?: CSSProperties;
  className?: string;
  "aria-label"?: string;
};

/** M3E 按钮：五档尺寸，图标 + 文字，圆角始终是高度的半径 */
export function Button({
  children,
  label,
  icon,
  variant = "filled",
  size = 56,
  width,
  onClick,
  disabled,
  selected,
  selectedVariant,
  fullWidth,
  style,
  className,
  ...rest
}: ButtonProps) {
  const { palette } = useMd3e();
  const w = useWeight();
  const h = Math.min(BUTTON_H_MAX, Math.max(BUTTON_H_MIN, Math.round(size)));
  const m = buttonMetrics(h);
  const text = label ?? (typeof children === "string" ? children : undefined);
  const hasLabel = !!text || (!!children && !icon);
  const padX = hasLabel ? m.padX : Math.round((m.h - m.icon) / 2);
  const useVariant = selected && selectedVariant ? selectedVariant : variant;

  return (
    <Pressable
      palette={palette}
      variant={useVariant}
      disabled={disabled}
      onClick={onClick}
      aria-label={rest["aria-label"] ?? (!hasLabel ? text : undefined)}
      style={{
        height: m.h,
        width: fullWidth ? "100%" : width,
        minWidth: width,
        borderRadius: scaleR(h / 2),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ["--md3e-press-scale" as any]: 0.97,
        ...style,
      }}
      className={`m3-size-ease ${className ?? ""}`.trim()}
    >
      <span
        className="m3-size-ease"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: icon && hasLabel ? m.gap : 0,
          paddingLeft: padX,
          paddingRight: padX,
          height: m.h,
          fontSize: m.font,
          fontWeight: w(500, 700),
          letterSpacing: 0.1,
          whiteSpace: "nowrap",
        }}
      >
        {icon && <Icon name={icon} size={m.icon} fill={useVariant === "filled"} />}
        {children ?? (hasLabel ? <span>{text}</span> : null)}
      </span>
    </Pressable>
  );
}

/* ---------- Icon Button ---------- */

export type IconButtonProps = {
  icon: string;
  variant?: Variant;
  /** 直径，也就是按钮高度（32..136dp） */
  size?: number;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  /** 选中态：图标填充 + 换 variant */
  selected?: boolean;
  selectedVariant?: Variant;
  /** 是否是可切换按钮 */
  toggle?: boolean;
  title?: string;
  style?: CSSProperties;
  className?: string;
};

/** M3 Icon Button：一个圆形，里面只有一个图标 */
export function IconButton({
  icon,
  variant = "tonal",
  size = 56,
  onClick,
  disabled,
  selected,
  selectedVariant = "filled",
  toggle,
  title,
  style,
  className,
}: IconButtonProps) {
  const { palette } = useMd3e();
  const h = Math.min(BUTTON_H_MAX, Math.max(BUTTON_H_MIN, Math.round(size)));
  const m = buttonMetrics(h);
  const on = !!selected;
  const useVariant = toggle && on ? selectedVariant : variant;

  return (
    <Pressable
      palette={palette}
      variant={useVariant}
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={title ?? icon}
      aria-pressed={toggle ? on : undefined}
      style={{
        width: h,
        height: h,
        flex: "0 0 auto",
        borderRadius: scaleR(h / 2),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ["--md3e-press-scale" as any]: 0.94,
        ...style,
      }}
      className={`m3-size-ease ${className ?? ""}`.trim()}
    >
      <span className="m3-size-ease" style={{ display: "grid", placeItems: "center" }}>
        <Icon name={icon} size={m.icon} fill={useVariant === "filled"} />
      </span>
    </Pressable>
  );
}

/* ---------- FAB ---------- */

export type FabProps = {
  icon: string;
  variant?: Variant;
  /** 直径（40 / 56 / 96dp，或其间任意值） */
  size?: number;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  title?: string;
  style?: CSSProperties;
  className?: string;
};

/** M3 FAB：圆形，图标随直径缩放 */
export function Fab({ icon, variant = "tonal", size = 56, onClick, disabled, title, style, className }: FabProps) {
  const { palette } = useMd3e();
  const d = Math.min(FAB_H_MAX, Math.max(FAB_H_MIN, Math.round(size)));

  return (
    <Pressable
      palette={palette}
      variant={variant}
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={title ?? icon}
      style={{
        width: d,
        height: d,
        flex: "0 0 auto",
        borderRadius: scaleR(Math.round(d * 0.28)),
        boxShadow: "0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12)",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ["--md3e-press-scale" as any]: 0.96,
        ...style,
      }}
      className={`m3-size-ease ${className ?? ""}`.trim()}
    >
      <Icon name={icon} size={Math.round(d * 0.42)} fill={variant === "filled"} />
    </Pressable>
  );
}

/* ---------- Extended FAB ---------- */

export type ExtendedFabProps = {
  label: string;
  icon?: string;
  variant?: Variant;
  /** 高度 56..96dp */
  size?: number;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
};

/** M3 Extended FAB：带文字的 FAB，内边距与字号随高度增长 */
export function ExtendedFab({
  label,
  icon,
  variant = "tonal",
  size = 56,
  onClick,
  disabled,
  style,
  className,
}: ExtendedFabProps) {
  const { palette } = useMd3e();
  const w = useWeight();
  const h = extendedFabHeight(size);
  const m = extendedFabMetrics(h);
  const hasLabel = label.trim().length > 0;

  return (
    <Pressable
      palette={palette}
      variant={variant}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      style={{
        height: m.h,
        borderRadius: scaleR(m.radius),
        boxShadow: variant === "elevated" ? undefined : "0 3px 8px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.10)",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ["--md3e-press-scale" as any]: 0.97,
        ...style,
      }}
      className={`m3-size-ease ${className ?? ""}`.trim()}
    >
      <span
        className="m3-size-ease"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: icon && hasLabel ? m.gap : 0,
          paddingLeft: m.padX,
          paddingRight: m.padX,
          height: m.h,
          fontSize: m.font,
          fontWeight: w(500, 700),
          whiteSpace: "nowrap",
        }}
      >
        {icon && <Icon name={icon} size={m.icon} fill={variant === "filled"} />}
        {hasLabel && <span>{label}</span>}
      </span>
    </Pressable>
  );
}

/** 一组按钮连成的紧邻按钮组：外圆内方 */
export function ButtonGroup({
  children,
  gap = 3,
  style,
}: {
  children: ReactNode;
  gap?: number;
  style?: CSSProperties;
}) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap, ...style }}>{children}</div>
  );
}

export type { Palette };
