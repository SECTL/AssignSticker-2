"use client";

/**
 * Split Button：一分为二的按钮 —— 承载动作的文字段 + 打开菜单的箭头段。
 * 移植自 m3e-canvas `M3Node.tsx` 的 SplitButtonContent / SplitMenuContent。
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "./Icon";
import { RippleProvider, RippleShape, useRipples } from "./Ripple";
import { useMd3e, useWeight } from "./theme";
import {
  ButtonMetrics,
  BUTTON_H_MAX,
  BUTTON_H_MIN,
  Palette,
  R_INNER,
  scaleR,
  SPLIT_GAP,
  SPLIT_MENU_ITEM_H,
  SPLIT_MENU_PAD,
  SPLIT_MENU_SHEET_GAP,
  SplitMetrics,
  splitMetrics,
  Variant,
  variantShadow,
  variantStyle,
} from "./tokens";

export type SplitMenuItem = { icon?: string; label: string };

export type SplitButtonProps = {
  label?: string;
  icon?: string;
  variant?: Variant;
  /** 高度 32..136dp */
  size?: number;
  /** 打开菜单时展示的条目 */
  menu?: SplitMenuItem[];
  /** 菜单是否展开（受控）；不传则自行管理 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (item: SplitMenuItem, index: number) => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
};

const MENU_EASE = "cubic-bezier(0.2, 0, 0, 1)";

/** M3 Split Button */
export function SplitButton({
  label,
  icon,
  variant = "filled",
  size = 56,
  menu = [],
  open,
  onOpenChange,
  onSelect,
  onClick,
  disabled,
  style,
  className,
}: SplitButtonProps) {
  const { palette } = useMd3e();
  const w = useWeight();
  const h = Math.min(BUTTON_H_MAX, Math.max(BUTTON_H_MIN, Math.round(size)));
  const m: SplitMetrics = splitMetrics(h);
  const outer = scaleR(h / 2);
  const inner = scaleR(R_INNER);
  const st = variantStyle(variant, palette);
  const hasLabel = !!label && label.trim().length > 0;
  const padX = hasLabel ? m.padX : Math.round((m.h - m.icon) / 2);
  const shadow = variantShadow(variant);

  const controlled = open !== undefined;
  const [innerOpen, setInnerOpen] = useState(false);
  const isOpen = controlled ? !!open : innerOpen;
  const setOpen = (v: boolean) => {
    if (!controlled) setInnerOpen(v);
    onOpenChange?.(v);
  };

  const growRef = useRef<HTMLDivElement>(null);
  const ripples = useRipples(true);
  const ink = typeof st.color === "string" ? st.color : palette.onSurface;

  /* 点外面收起 */
  useEffect(() => {
    if (!isOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (growRef.current && !growRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div ref={growRef} className={className} style={{ position: "relative", display: "inline-flex", ...style }}>
      <RippleProvider list={ripples.list} color={ink}>
        <span
          onPointerDown={ripples.add}
          onPointerCancel={ripples.end}
          className="m3-size-ease"
          data-part-shape="main"
          onClick={(e) => {
            if (disabled) return;
            onClick?.(e);
          }}
          style={{
            ...st,
            display: "inline-flex",
            alignItems: "center",
            gap: hasLabel && icon ? m.gap : 0,
            height: m.h,
            paddingLeft: padX,
            paddingRight: padX,
            borderTopLeftRadius: outer,
            borderBottomLeftRadius: outer,
            borderTopRightRadius: inner,
            borderBottomRightRadius: inner,
            fontSize: m.font,
            fontWeight: w(500, 700),
            whiteSpace: "nowrap",
            boxSizing: "border-box",
            boxShadow: shadow,
            position: "relative",
            overflow: "hidden",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.38 : 1,
            userSelect: "none",
          }}
        >
          {icon && <Icon name={icon} size={m.icon} fill={variant === "filled"} />}
          {hasLabel && <span>{label}</span>}
          <RippleShape part="main" />
        </span>

        <span
          onPointerDown={ripples.add}
          onPointerCancel={ripples.end}
          className="m3-size-ease"
          data-part-shape="menu"
          role="button"
          aria-label="打开菜单"
          aria-expanded={isOpen}
          onClick={() => !disabled && setOpen(!isOpen)}
          style={{
            ...st,
            display: "inline-grid",
            placeItems: "center",
            position: "relative",
            overflow: "hidden",
            height: m.h,
            paddingLeft: m.trailPadX,
            paddingRight: m.trailPadX,
            /* 展开时这一段的左侧也变圆，与 M3 一致；文字段保持原形状 */
            borderTopLeftRadius: isOpen ? outer : inner,
            borderBottomLeftRadius: isOpen ? outer : inner,
            borderTopRightRadius: outer,
            borderBottomRightRadius: outer,
            boxSizing: "border-box",
            boxShadow: shadow,
            marginLeft: SPLIT_GAP,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.38 : 1,
            userSelect: "none",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: `transform 200ms ${MENU_EASE}`,
            }}
          >
            <Icon name="keyboard_arrow_down" size={m.icon} />
          </span>
          <RippleShape part="menu" />
        </span>
      </RippleProvider>

      {/* 菜单：从按钮的下边缘展开 */}
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: SPLIT_MENU_SHEET_GAP,
          minWidth: 160,
          transformOrigin: "50% 0%",
          background: palette.surfaceContainer,
          color: palette.onSurface,
          borderRadius: scaleR(12),
          padding: `${SPLIT_MENU_PAD}px 0`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)",
          boxSizing: "border-box",
          overflow: "hidden",
          zIndex: 40,
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "scaleY(1)" : "scaleY(0.7)",
          pointerEvents: isOpen ? "auto" : "none",
          transition: `opacity 200ms ${MENU_EASE}, transform 260ms ${MENU_EASE}`,
        }}
      >
        {menu.map((item, i) => (
          <div
            key={i}
            className="md3e-split-menu-item"
            onClick={() => {
              if (disabled) return;
              onSelect?.(item, i);
              setOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              height: SPLIT_MENU_ITEM_H,
              padding: "0 12px",
              fontSize: 14,
              fontWeight: w(500, 700),
              whiteSpace: "nowrap",
              boxSizing: "border-box",
              cursor: "pointer",
              opacity: isOpen ? 1 : 0,
              transition: `opacity 120ms ${MENU_EASE} ${isOpen ? i * 45 : 0}ms`,
            }}
          >
            {item.icon && <Icon name={item.icon} size={24} />}
            <span
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { ButtonMetrics, Palette };
