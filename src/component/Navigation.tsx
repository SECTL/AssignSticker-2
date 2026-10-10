"use client";

/**
 * 导航类控件：TopAppBar / BottomNav / NavRail / Toolbar / Tabs / SearchBar。
 * 样式移植自 m3e-canvas `M3Node.tsx` 的对应分支。
 */

import { useState, type CSSProperties } from "react";
import { Icon } from "./Icon";
import { useMd3e, useWeight } from "./theme";
import { railSelectedLabelColor } from "./color";
import {
  CONTENT_W,
  ellipsis,
  NAV_BAR_H,
  PHONE_W,
  RAIL_COLLAPSED_W,
  RAIL_EXPANDED_W,
  RAIL_GAP,
  RAIL_ITEM_H,
  RAIL_TOP,
  RAIL_W,
  scaleR,
  STATUS_BAR_H,
  TOP_BAR_SIZES,
  topBarFontOf,
  topBarHeightOf,
  Variant,
} from "./tokens";

/* ---------- Top App Bar ---------- */

export type TopAppBarProps = {
  title: string;
  /** 前置图标（通常是 menu） */
  icon?: string;
  /** 尾部图标（通常是 more_vert） */
  icon2?: string;
  /** 64 / 112 / 152，或其间任意高度；标题在 medium/large 时降到单独一行 */
  size?: number;
  /** 宽度；不大于手机宽度时带状态栏 inset */
  width?: number;
  onIconClick?: () => void;
  onIcon2Click?: () => void;
  style?: CSSProperties;
  className?: string;
};

/** M3 顶部应用栏（small / medium / large 三档） */
export function TopAppBar({
  title,
  icon = "menu",
  icon2,
  size = 64,
  width = PHONE_W,
  onIconClick,
  onIcon2Click,
  style,
  className,
}: TopAppBarProps) {
  const { palette } = useMd3e();
  const w = useWeight();
  const barH = topBarHeightOf(size);
  const tall = barH > TOP_BAR_SIZES[0].h;
  const font = topBarFontOf(size);
  const inset = width > PHONE_W ? 0 : STATUS_BAR_H;

  return (
    <div
      className={`m3-size-ease ${className ?? ""}`.trim()}
      style={{
        background: palette.surfaceContainer,
        color: palette.onSurface,
        width,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        paddingTop: inset,
        position: "relative",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 4px", height: 64, flex: "0 0 auto" }}>
        <div
          className="md3e-icon-slot"
          onClick={onIconClick}
          style={{ width: 48, height: 48, display: "grid", placeItems: "center", flex: "0 0 auto" }}
        >
          {icon && <Icon name={icon} size={24} color={palette.onSurface} />}
        </div>
        <div
          className="m3-size-ease"
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: tall ? 0 : font,
            opacity: tall ? 0 : 1,
            fontWeight: w(400, 600),
            color: palette.onSurface,
            transition: "opacity 200ms",
            ...ellipsis,
          }}
        >
          {title}
        </div>
        <div
          className="md3e-icon-slot"
          onClick={onIcon2Click}
          style={{ width: 48, height: 48, display: "grid", placeItems: "center", flex: "0 0 auto" }}
        >
          {icon2 && <Icon name={icon2} size={24} color={palette.onSurfaceVariant} />}
        </div>
      </div>
      {tall && (
        <div
          className="m3-size-ease"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "flex-end",
            padding: "0 16px 24px",
            fontSize: font,
            lineHeight: 1.2,
            fontWeight: w(400, 600),
            color: palette.onSurface,
            ...ellipsis,
          }}
        >
          {title}
        </div>
      )}
    </div>
  );
}

/* ---------- Navigation Bar ---------- */

export type NavDestination = { icon: string; label?: string };

export type BottomNavProps = {
  destinations: NavDestination[];
  selected?: number;
  onSelect?: (index: number) => void;
  width?: number;
  style?: CSSProperties;
  className?: string;
};

/** M3 底部导航栏 */
export function BottomNav({ destinations, selected = 0, onSelect, width = PHONE_W, style, className }: BottomNavProps) {
  const { palette } = useMd3e();
  const w = useWeight();

  return (
    <div
      className={className}
      style={{
        background: palette.surfaceContainer,
        color: palette.onSurface,
        width,
        height: 80 + NAV_BAR_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: `0 4px ${NAV_BAR_H}px`,
        boxSizing: "border-box",
        position: "relative",
        ...style,
      }}
    >
      {destinations.map((d, i) => {
        const on = i === Math.min(selected, Math.max(0, destinations.length - 1));
        return (
          <div
            key={i}
            className="md3e-nav-item"
            onClick={() => onSelect?.(i)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              flex: 1,
              minWidth: 0,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 56,
                height: 32,
                borderRadius: scaleR(16),
                display: "grid",
                placeItems: "center",
                background: on ? palette.secondaryContainer : "transparent",
                color: on ? palette.onSecondaryContainer : palette.onSurfaceVariant,
                transition: "background 160ms, color 160ms",
              }}
            >
              <Icon name={d.icon} size={22} fill={on} />
            </div>
            {d.label && d.label.trim() && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: on ? w(600, 700) : w(400, 500),
                  color: on ? palette.onSurface : palette.onSurfaceVariant,
                  maxWidth: "100%",
                  ...ellipsis,
                }}
              >
                {d.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Navigation Rail ---------- */

export type NavRailProps = {
  destinations: NavDestination[];
  selected?: number;
  onSelect?: (index: number) => void;
  /** true = M3E 宽轨（220dp）展开；false = 96dp 收起；undefined = 经典 80dp rail */
  expanded?: boolean;
  /** 展开时是否作为浮层盖住内容 */
  modal?: boolean;
  height?: number;
  style?: CSSProperties;
  className?: string;
};

/** M3 导航栏（侧边），同时支持经典 80dp 与 M3E 宽轨两种形态 */
export function NavRail({
  destinations,
  selected = 0,
  onSelect,
  expanded,
  modal,
  height = 892,
  style,
  className,
}: NavRailProps) {
  const { palette } = useMd3e();
  const w = useWeight();
  const wide = expanded !== undefined || modal === true;
  const isExpanded = !!expanded;
  const width = isExpanded ? RAIL_EXPANDED_W : wide ? RAIL_COLLAPSED_W : RAIL_W;
  const sel = Math.min(selected, Math.max(0, destinations.length - 1));

  if (wide) {
    const inset = 12;
    const itemH = 56;
    const gap = isExpanded ? 0 : 4;
    const top = RAIL_TOP + 56;
    const headerLeft = isExpanded ? 16 : (width - 48) / 2;
    return (
      <div
        className={className}
        style={{
          width,
          height,
          background: palette.surfaceContainer,
          color: palette.onSurface,
          position: "relative",
          boxSizing: "border-box",
          flex: "0 0 auto",
          borderRadius: isExpanded && modal ? 16 : 0,
          boxShadow: isExpanded && modal ? "0 2px 6px rgba(0,0,0,0.16), 0 1px 2px rgba(0,0,0,0.10)" : undefined,
          ...style,
        }}
      >
        <div
          className="m3-rail-geometry"
          style={{
            position: "absolute",
            left: headerLeft,
            top: RAIL_TOP,
            width: 48,
            height: 48,
            display: "grid",
            placeItems: "center",
            color: palette.onSurfaceVariant,
          }}
        >
          <Icon name={isExpanded ? "menu_open" : "menu"} size={24} />
        </div>
        {destinations.map((d, i) => {
          const on = i === sel;
          return (
            <div
              key={i}
              className="m3-rail-geometry md3e-nav-item"
              onClick={() => onSelect?.(i)}
              style={{
                position: "absolute",
                left: inset,
                top: top + i * (itemH + gap),
                width: width - inset * 2,
                height: itemH,
                cursor: "pointer",
              }}
            >
              <div
                className="m3-rail-geometry"
                style={{
                  position: "absolute",
                  left: isExpanded ? 0 : 8,
                  top: 0,
                  width: isExpanded ? width - inset * 2 : 56,
                  height: isExpanded ? 56 : 32,
                  borderRadius: isExpanded ? 28 : 16,
                  background: on ? palette.secondaryContainer : "transparent",
                  transition: "background 160ms",
                }}
              />
              <div
                className="m3-rail-geometry"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 24,
                  height: 24,
                  transform: `translate(${isExpanded ? 16 : 24}px, ${isExpanded ? 16 : 4}px)`,
                  color: on ? palette.onSecondaryContainer : palette.onSurfaceVariant,
                }}
              >
                <Icon name={d.icon} size={24} fill={on} />
              </div>
              {d.label && d.label.trim() && (
                <span
                  className="m3-rail-geometry"
                  style={{
                    position: "absolute",
                    left: isExpanded ? 48 : 0,
                    top: isExpanded ? 18 : 36,
                    width: isExpanded ? width - 88 : 72,
                    textAlign: isExpanded ? "left" : "center",
                    fontSize: isExpanded ? 14 : 12,
                    lineHeight: "20px",
                    fontWeight: on ? w(600, 700) : w(400, 500),
                    color: on ? railSelectedLabelColor(palette, isExpanded) : palette.onSurfaceVariant,
                    ...ellipsis,
                  }}
                >
                  {d.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* 经典 80dp rail */
  return (
    <div
      className={className}
      style={{
        width: RAIL_W,
        height,
        background: palette.surfaceContainer,
        color: palette.onSurface,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: RAIL_GAP,
        padding: `${RAIL_TOP}px 0`,
        boxSizing: "border-box",
        position: "relative",
        flex: "0 0 auto",
        ...style,
      }}
    >
      {destinations.map((d, i) => {
        const on = i === sel;
        return (
          <div
            key={i}
            className="md3e-nav-item"
            onClick={() => onSelect?.(i)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              width: RAIL_W - 12,
              height: RAIL_ITEM_H,
              flex: "0 0 auto",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 56,
                height: 32,
                borderRadius: scaleR(16),
                display: "grid",
                placeItems: "center",
                background: on ? palette.secondaryContainer : "transparent",
                color: on ? palette.onSecondaryContainer : palette.onSurfaceVariant,
                transition: "background 160ms, color 160ms",
              }}
            >
              <Icon name={d.icon} size={22} fill={on} />
            </div>
            {d.label && d.label.trim() && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: on ? w(600, 700) : w(400, 500),
                  color: on ? palette.onSurface : palette.onSurfaceVariant,
                  maxWidth: "100%",
                  ...ellipsis,
                }}
              >
                {d.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Toolbar ---------- */

export type ToolbarProps = {
  items: { icon?: string; label?: string }[];
  variant?: Variant;
  onSelect?: (index: number) => void;
  style?: CSSProperties;
  className?: string;
};

/** 悬浮工具栏：一排 48dp 图标按钮 */
export function Toolbar({ items, variant = "tonal", onSelect, style, className }: ToolbarProps) {
  const { palette } = useMd3e();
  const vibrant = variant === "filled";
  const n = Math.max(1, items.length);
  const width = 16 + n * 48 + (n - 1) * 4;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "0 8px",
        height: 64,
        width,
        boxSizing: "border-box",
        borderRadius: scaleR(32),
        background: vibrant ? palette.primaryContainer : palette.surfaceContainer,
        color: vibrant ? palette.onPrimaryContainer : palette.onSurfaceVariant,
        boxShadow: "0 2px 6px rgba(0,0,0,0.14), 0 1px 2px rgba(0,0,0,0.10)",
        ...style,
      }}
    >
      {items.map((it, i) => (
        <span
          key={i}
          className="md3e-icon-slot"
          onClick={() => onSelect?.(i)}
          style={{
            width: 48,
            height: 48,
            borderRadius: scaleR(24),
            display: "grid",
            placeItems: "center",
            color: vibrant ? palette.onPrimaryContainer : palette.onSurfaceVariant,
            flex: "0 0 auto",
          }}
        >
          {it.icon && <Icon name={it.icon} size={24} />}
        </span>
      ))}
    </div>
  );
}

/* ---------- Tabs ---------- */

export type TabsProps = {
  tabs: { label: string }[];
  selected?: number;
  onSelect?: (index: number) => void;
  width?: number;
  /** 超过 5 个且放不下时自动变成可滚动标签 */
  style?: CSSProperties;
  className?: string;
};

const SCROLL_TAB_W = 96;

/** M3 主标签行 */
export function Tabs({ tabs, selected = 0, onSelect, width = PHONE_W, style, className }: TabsProps) {
  const { palette } = useMd3e();
  const w = useWeight();
  const scroll = tabs.length > 5 && tabs.length * SCROLL_TAB_W > width;
  const offset = scroll
    ? Math.max(0, Math.min(Math.max(0, tabs.length * SCROLL_TAB_W - width), (Math.min(selected, tabs.length - 1) + 1.5) * SCROLL_TAB_W - width))
    : 0;
  const sel = Math.min(selected, Math.max(0, tabs.length - 1));

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "stretch",
        height: 48,
        width,
        position: "relative",
        overflow: "hidden",
        background: palette.surface,
        color: palette.onSurface,
        ...style,
      }}
    >
      {tabs.map((tb, i) => {
        const on = i === sel;
        return (
          <div
            key={i}
            className="md3e-tab"
            onClick={() => onSelect?.(i)}
            style={{
              flex: scroll ? "none" : 1,
              width: scroll ? SCROLL_TAB_W : undefined,
              marginLeft: scroll && i === 0 ? -offset : undefined,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              position: "relative",
              padding: "0 8px",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: w(500, 700),
                color: on ? palette.primary : palette.onSurfaceVariant,
                padding: "0 4px 14px",
                maxWidth: "100%",
                ...ellipsis,
              }}
            >
              {tb.label}
            </span>
            {on && (
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 0,
                  transform: "translateX(-50%)",
                  width: "calc(100% - 24px)",
                  height: 3,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                  background: palette.primary,
                }}
              />
            )}
          </div>
        );
      })}
      <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1, background: palette.outlineVariant }} />
    </div>
  );
}

/* ---------- Search Bar ---------- */

export type SearchBarProps = {
  placeholder?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  variant?: Variant;
  width?: number;
  value?: string;
  onChange?: (v: string) => void;
  style?: CSSProperties;
  className?: string;
};

/** M3 搜索栏 */
export function SearchBar({
  placeholder = "搜索",
  leadingIcon = "search",
  trailingIcon = "mic",
  variant = "filled",
  width = CONTENT_W,
  value,
  onChange,
  style,
  className,
}: SearchBarProps) {
  const { palette } = useMd3e();
  const outlined = variant === "outlined";
  const [inner, setInner] = useState("");
  const text = value !== undefined ? value : inner;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
        height: 56,
        width,
        boxSizing: "border-box",
        borderRadius: scaleR(28),
        background: outlined ? palette.surface : palette.surfaceContainerHigh,
        border: outlined ? `1px solid ${palette.outline}` : "none",
        color: palette.onSurface,
        ...style,
      }}
    >
      {leadingIcon && <Icon name={leadingIcon} size={24} color={palette.onSurface} />}
      <input
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          if (value === undefined) setInner(e.target.value);
          onChange?.(e.target.value);
        }}
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 16,
          color: palette.onSurface,
          background: "transparent",
          border: "none",
          outline: "none",
          fontFamily: "inherit",
        }}
      />
      {trailingIcon && <Icon name={trailingIcon} size={24} color={palette.onSurfaceVariant} />}
    </div>
  );
}
