"use client";

/**
 * 可按下表面的公共基座。
 * 承担 M3 的按下态：涟漪 + 轻微缩放，并把 variant 的填充/边框/文字色画好。
 * 按钮族（按钮、图标按钮、FAB、Chip、SplitButton）都建在它上面。
 */

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { RippleProvider, RippleShape, useRipples } from "./Ripple";
import { Variant, variantShadow, variantStyle, Palette } from "./tokens";

export type PressableProps = {
  palette: Palette;
  variant?: Variant;
  /** 是否启用涟漪 */
  ripple?: boolean;
  /** 按下的缩放；0 表示不缩放 */
  pressScale?: number;
  /** 涟漪的颜色，默认取 variant 的文字色 */
  rippleColor?: string;
  shadow?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onPointerDown?: (e: React.PointerEvent<HTMLElement>) => void;
  disabled?: boolean;
  title?: string;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
  role?: string;
  tabIndex?: number;
};

/** 按钮族的按下基座：variant 上色 + 涟漪 + 缩放 */
export const Pressable = forwardRef<HTMLSpanElement, PressableProps>(function Pressable(
  {
    palette,
    variant = "filled",
    ripple = true,
    pressScale = 0.97,
    rippleColor,
    shadow,
    className,
    style,
    children,
    onClick,
    onPointerDown,
    disabled,
    title,
    role,
    tabIndex,
    ...rest
  },
  ref,
) {
  const st = variantStyle(variant, palette);
  const ripples = useRipples(ripple && !disabled);
  const ink = rippleColor ?? (typeof st.color === "string" ? st.color : palette.onSurface);

  return (
    <span
      ref={ref}
      className={`md3e-pressable${className ? ` ${className}` : ""}`}
      role={role ?? "button"}
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      aria-disabled={disabled || undefined}
      title={title}
      onPointerDown={(e) => {
        ripples.add(e);
        onPointerDown?.(e);
      }}
      onPointerCancel={ripples.end}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      style={{
        ...st,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        overflow: "hidden",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.38 : 1,
        userSelect: "none",
        touchAction: "manipulation",
        boxShadow: shadow ?? variantShadow(variant),
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
      {...rest}
    >
      <RippleProvider list={ripples.list} color={ink}>
        {children}
        <RippleShape part={null} />
      </RippleProvider>
    </span>
  );
});

/** 给任意形状（已自带 variant 上色）挂上涟漪：用在 split button 这种多段部件上 */
export function RippleHost({
  list,
  color,
  children,
}: {
  list: ReturnType<typeof useRipples>["list"];
  color: string;
  children: ReactNode;
}) {
  return (
    <RippleProvider list={list} color={color}>
      {children}
    </RippleProvider>
  );
}
