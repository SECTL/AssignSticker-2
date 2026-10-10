"use client";

/**
 * 字段类控件：TextField / Select（下拉）。
 * 样式移植自 m3e-canvas `M3Node.tsx` 的 textField / select 分支与 `boxStyle()`。
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "./Icon";
import { useMd3e } from "./theme";
import { CONTENT_W, ellipsis, scaleR, Variant } from "./tokens";

/* ---------- Text Field ---------- */

export type TextFieldProps = {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  /** 前置图标 */
  icon?: string;
  /** 尾部图标（如清空） */
  trailingIcon?: string;
  onTrailingClick?: () => void;
  supportingText?: string;
  /** 出错时 label 与下划线变红 */
  error?: boolean;
  variant?: Variant;
  /** 只读展示（不接收输入） */
  readOnly?: boolean;
  width?: number;
  style?: CSSProperties;
  className?: string;
};

/** M3 文本框：outlined 有描边，filled 有底部下划线 */
export function TextField({
  label,
  value,
  defaultValue,
  onChange,
  placeholder,
  icon,
  trailingIcon,
  onTrailingClick,
  supportingText,
  error,
  variant = "outlined",
  readOnly,
  width = CONTENT_W,
  style,
  className,
}: TextFieldProps) {
  const { palette } = useMd3e();
  const filled = variant === "filled";
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue ?? "");
  const [focused, setFocused] = useState(false);
  const text = controlled ? (value as string) : inner;
  const hasValue = text.length > 0;
  const float = focused || hasValue;
  const accent = error ? palette.error : palette.primary;
  const labelColor = error ? palette.error : focused ? palette.primary : palette.onSurfaceVariant;

  return (
    <div className={className} style={{ width, position: "relative", ...style }}>
      <div
        style={{
          position: "relative",
          height: 56,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          borderRadius: scaleR(16),
          background: filled ? palette.surfaceContainerHighest : "transparent",
          border: filled ? "none" : `1px solid ${focused ? accent : palette.outline}`,
          borderBottomWidth: filled ? undefined : focused ? 2 : 1,
          transition: "border-color 140ms",
        }}
      >
        {icon && <Icon name={icon} size={24} color={focused ? accent : palette.onSurfaceVariant} />}
        <input
          value={text}
          readOnly={readOnly}
          placeholder={float ? placeholder : ""}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            if (readOnly) return;
            if (!controlled) setInner(e.target.value);
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
        {trailingIcon && (
          <span onClick={onTrailingClick} style={{ display: "grid", placeItems: "center", cursor: onTrailingClick ? "pointer" : undefined }}>
            <Icon name={trailingIcon} size={24} color={palette.onSurfaceVariant} />
          </span>
        )}

        {label?.trim() && (
          <span
            style={{
              position: "absolute",
              left: icon ? 52 : 16,
              top: filled ? (float ? 6 : 16) : float ? -8 : 16,
              fontSize: float ? 12 : 16,
              lineHeight: "16px",
              color: labelColor,
              background: filled ? "transparent" : palette.surface,
              padding: filled ? 0 : "0 4px",
              marginLeft: filled ? 0 : -4,
              pointerEvents: "none",
              transition: "top 140ms, font-size 140ms, color 140ms",
            }}
          >
            {label}
          </span>
        )}

        {filled && (
          <span
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: focused ? 2 : 1,
              borderRadius: 1,
              background: focused ? accent : palette.onSurfaceVariant,
              transition: "height 140ms, background 140ms",
            }}
          />
        )}
      </div>

      {supportingText?.trim() && (
        <span
          style={{
            display: "block",
            marginTop: 4,
            paddingLeft: 16,
            fontSize: 12,
            color: error ? palette.error : palette.onSurfaceVariant,
            ...ellipsis,
          }}
        >
          {supportingText}
        </span>
      )}
    </div>
  );
}

/* ---------- Select ---------- */

export type SelectOption = { label: string; value?: string };

export type SelectProps = {
  label?: string;
  options: SelectOption[];
  /** 当前选项下标；undefined 表示未选择 */
  selected?: number;
  onSelect?: (index: number, option: SelectOption) => void;
  icon?: string;
  supportingText?: string;
  variant?: Variant;
  width?: number;
  style?: CSSProperties;
  className?: string;
};

/** M3 下拉选择：闭合时是一行「值 + 箭头」，点开从下方展开菜单 */
export function Select({
  label,
  options,
  selected,
  onSelect,
  icon,
  supportingText,
  variant = "outlined",
  width = CONTENT_W,
  style,
  className,
}: SelectProps) {
  const { palette } = useMd3e();
  const filled = variant === "filled";
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const value = selected === undefined ? undefined : options[selected]?.label;
  const hasValue = value !== undefined && value !== "";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={box} className={className} style={{ width, position: "relative", ...style }}>
      <div
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "relative",
          height: 56,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 12px 0 16px",
          borderRadius: scaleR(16),
          background: filled ? palette.surfaceContainerHighest : palette.surface,
          border: filled ? "none" : `1px solid ${open ? palette.primary : palette.outline}`,
          cursor: "pointer",
          transition: "border-color 140ms",
        }}
      >
        {icon && <Icon name={icon} size={24} color={palette.onSurfaceVariant} />}
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 16,
            color: hasValue ? palette.onSurface : palette.onSurfaceVariant,
            paddingTop: hasValue && filled ? 16 : 0,
            ...ellipsis,
          }}
        >
          {hasValue ? value : label}
        </span>
        <span
          style={{
            display: "inline-flex",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 200ms cubic-bezier(0.2,0,0,1)",
          }}
        >
          <Icon name="arrow_drop_down" size={24} color={palette.onSurfaceVariant} />
        </span>

        {hasValue && label?.trim() && (
          <span
            style={{
              position: "absolute",
              left: icon ? 52 : 16,
              top: filled ? 8 : -8,
              fontSize: 12,
              lineHeight: "16px",
              color: palette.onSurfaceVariant,
              background: filled ? "transparent" : palette.surface,
              padding: filled ? 0 : "0 4px",
              marginLeft: filled ? 0 : -4,
            }}
          >
            {label}
          </span>
        )}
        {filled && (
          <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1, background: palette.onSurfaceVariant }} />
        )}
      </div>

      {supportingText?.trim() && (
        <span style={{ display: "block", marginTop: 4, paddingLeft: 16, fontSize: 12, color: palette.onSurfaceVariant, ...ellipsis }}>
          {supportingText}
        </span>
      )}

      {/* 菜单 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "calc(100% + 4px)",
          background: palette.surfaceContainer,
          color: palette.onSurface,
          borderRadius: scaleR(12),
          padding: "8px 0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)",
          transformOrigin: "50% 0%",
          opacity: open ? 1 : 0,
          transform: open ? "scaleY(1)" : "scaleY(0.7)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 180ms cubic-bezier(0.2,0,0,1), transform 240ms cubic-bezier(0.2,0,0,1)",
          overflow: "hidden",
          zIndex: 40,
        }}
      >
        {options.map((o, i) => {
          const on = i === selected;
          return (
            <div
              key={i}
              className="md3e-menu-item"
              onClick={() => {
                onSelect?.(i, o);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                height: 48,
                padding: "0 16px",
                fontSize: 14,
                fontWeight: on ? 600 : 400,
                color: on ? palette.primary : palette.onSurface,
                cursor: "pointer",
                background: on ? palette.surfaceContainerHigh : "transparent",
              }}
            >
              <span style={{ flex: 1, minWidth: 0, ...ellipsis }}>{o.label}</span>
              {on && <Icon name="check" size={20} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
