"use client";

/**
 * FAB Menu：点开后从 FAB 上方展开一列条目，FAB 本身变成关闭按钮。
 * 移植自 m3e-canvas `M3Node.tsx` 的 FabMenuContent。
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "./Icon";
import { useMd3e, useWeight } from "./theme";
import {
  extendedFabHeight,
  extendedFabMetrics,
  FAB_H_MAX,
  FAB_H_MIN,
  scaleR,
  Variant,
  variantStyle,
} from "./tokens";

export type FabMenuItem = { icon?: string; label: string };

export type FabMenuProps = {
  icon?: string;
  label?: string;
  items: FabMenuItem[];
  variant?: Variant;
  /** FAB 直径（40..96dp） */
  size?: number;
  /** 传给 ExtendedFab 时用它 */
  extended?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (item: FabMenuItem, index: number) => void;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
};

const MENU_ITEM_H = 56;
const MENU_GAP = 8;
const CLOSE_D = 56;
const EASE = "cubic-bezier(0.2, 0, 0, 1)";

/** FAB + 展开菜单 */
export function FabMenu({
  icon = "add",
  label,
  items,
  variant = "filled",
  size = 56,
  extended = false,
  open,
  onOpenChange,
  onSelect,
  disabled,
  style,
  className,
}: FabMenuProps) {
  const { palette } = useMd3e();
  const w = useWeight();
  const controlled = open !== undefined;
  const [innerOpen, setInnerOpen] = useState(false);
  const isOpen = controlled ? !!open : innerOpen;
  const setOpen = (v: boolean) => {
    if (!controlled) setInnerOpen(v);
    onOpenChange?.(v);
  };

  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const filled = variant === "filled";
  const itemStyle: CSSProperties = filled
    ? { background: palette.primaryContainer, color: palette.onPrimaryContainer }
    : { background: palette.secondaryContainer, color: palette.onSecondaryContainer };

  const fabH = extended ? extendedFabHeight(size) : Math.min(FAB_H_MAX, Math.max(FAB_H_MIN, Math.round(size)));
  const efm = extendedFabMetrics(fabH);

  return (
    <div
      ref={box}
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        gap: MENU_GAP,
        ...style,
      }}
    >
      {items.map((item, i) => (
        <span
          key={i}
          role="button"
          tabIndex={0}
          onClick={() => {
            if (disabled) return;
            onSelect?.(item, i);
            setOpen(false);
          }}
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            height: MENU_ITEM_H,
            padding: "0 24px 0 20px",
            fontSize: 16,
            fontWeight: w(500, 700),
            whiteSpace: "nowrap",
            boxSizing: "border-box",
            cursor: "pointer",
            opacity: isOpen ? 1 : 0,
            /* 收起时不占位，避免出现叠在按钮上的残影 */
            pointerEvents: isOpen ? "auto" : "none",
            transition: `opacity ${isOpen ? "120ms" : "60ms"} ${EASE} ${isOpen ? (items.length - 1 - i) * 45 : i * 25}ms`,
          }}
        >
          {/* 药丸本体从右边缘展开，条目朝文字方向打开 */}
          <span
            aria-hidden
            style={{
              ...itemStyle,
              position: "absolute",
              inset: 0,
              transformOrigin: "100% 50%",
              transform: isOpen ? "scaleX(1)" : "scaleX(0.06)",
              borderRadius: scaleR(28),
              boxShadow: "0 1px 3px rgba(0,0,0,0.16)",
              transition: `transform ${isOpen ? "280ms" : "160ms"} ${EASE} ${isOpen ? (items.length - 1 - i) * 45 : i * 25}ms`,
            }}
          />
          <span
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              minWidth: 0,
              opacity: isOpen ? 1 : 0,
              transition: `opacity 120ms ${EASE} ${isOpen ? (items.length - 1 - i) * 45 + 140 : 0}ms`,
            }}
          >
            {item.icon && <Icon name={item.icon} size={22} />}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
          </span>
        </span>
      ))}

      {/* FAB 本身：展开时换成关闭图标 */}
      <span
        role="button"
        tabIndex={0}
        aria-label={isOpen ? "关闭" : (label ?? icon)}
        aria-expanded={isOpen}
        onClick={() => !disabled && setOpen(!isOpen)}
        style={{
          ...variantStyle(variant, palette),
          transformOrigin: "100% 100%",
          width: extended ? undefined : CLOSE_D,
          height: extended ? efm.h : CLOSE_D,
          padding: extended ? `0 ${efm.padX}px` : undefined,
          gap: 12,
          fontSize: extended ? efm.font : 16,
          fontWeight: w(500, 700),
          whiteSpace: "nowrap",
          borderRadius: scaleR(extended ? efm.radius : Math.round(CLOSE_D * 0.28)),
          display: "grid",
          placeItems: "center",
          gridAutoFlow: "column",
          boxShadow: "0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12)",
          flex: "0 0 auto",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.38 : 1,
          userSelect: "none",
          transition: `border-radius 220ms ${EASE}`,
        }}
      >
        <span style={{ display: "grid", placeItems: "center", gridArea: "1 / 1" }}>
          <span
            style={{
              gridArea: "1 / 1",
              display: "grid",
              placeItems: "center",
              opacity: isOpen ? 1 : 0,
              transition: `opacity 100ms ${EASE} ${isOpen ? "40ms" : "0ms"}`,
            }}
          >
            <Icon name="close" size={24} />
          </span>
          <span
            style={{
              gridArea: "1 / 1",
              display: "grid",
              placeItems: "center",
              opacity: isOpen ? 0 : 1,
              transition: `opacity 100ms ${EASE} ${isOpen ? "0ms" : "40ms"}`,
            }}
          >
            <Icon name={icon} size={24} />
          </span>
        </span>
        {extended && label && <span style={{ gridArea: "1 / 2", marginLeft: 12 }}>{label}</span>}
      </span>
    </div>
  );
}
