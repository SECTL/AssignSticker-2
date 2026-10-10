"use client";

/**
 * 输入类控件：Switch / Checkbox / Radio / Slider。
 * 样式移植自 m3e-canvas `M3Node.tsx` 的 SwitchControl / CheckboxContent / RadioContent / slider 分支。
 */

import { useState, type CSSProperties } from "react";
import { Icon } from "./Icon";
import { useMd3e } from "./theme";
import { ColorToken, CONTENT_W, ellipsis } from "./tokens";

/* ---------- Switch ---------- */

export type SwitchProps = {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  /** 固定宽度；设置后标签在左、开关在右两端对齐 */
  width?: number;
  style?: CSSProperties;
  className?: string;
};

/** M3 开关：52 × 32 轨道 + 会变大并显示对勾的手柄 */
export function Switch({ label, checked, defaultChecked, onChange, disabled, width, style, className }: SwitchProps) {
  const { palette } = useMd3e();
  const controlled = checked !== undefined;
  const [inner, setInner] = useState(!!defaultChecked);
  const on = controlled ? !!checked : inner;
  const toggle = () => {
    if (disabled) return;
    if (!controlled) setInner(!on);
    onChange?.(!on);
  };

  return (
    <span
      className={className}
      onClick={toggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        height: 48,
        width,
        boxSizing: "border-box",
        whiteSpace: "nowrap",
        justifyContent: width ? "space-between" : undefined,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.38 : 1,
        ...style,
      }}
    >
      {label?.trim() && (
        <span style={{ fontSize: 16, color: palette.onSurface, ...ellipsis }}>{label}</span>
      )}
      <span
        role="switch"
        aria-checked={on}
        aria-label={label}
        style={{
          position: "relative",
          width: 52,
          height: 32,
          borderRadius: 16,
          background: on ? palette.primary : palette.surfaceContainerHighest,
          border: on ? "2px solid transparent" : `2px solid ${palette.outline}`,
          boxSizing: "border-box",
          flex: "0 0 auto",
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
    </span>
  );
}

/* ---------- Checkbox ---------- */

export type CheckboxProps = {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  /** 三态：画出短横而不是对勾 */
  indeterminate?: boolean;
  style?: CSSProperties;
  className?: string;
};

/** M3 复选框（带 40dp 触摸区） */
export function Checkbox({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled,
  indeterminate,
  style,
  className,
}: CheckboxProps) {
  const { palette } = useMd3e();
  const controlled = checked !== undefined;
  const [inner, setInner] = useState(!!defaultChecked);
  const on = controlled ? !!checked : inner;
  const toggle = () => {
    if (disabled) return;
    if (!controlled) setInner(!on);
    onChange?.(!on);
  };

  const lined = on || indeterminate;
  return (
    <span
      className={className}
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : on}
      onClick={toggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 40,
        whiteSpace: "nowrap",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.38 : 1,
        ...style,
      }}
    >
      <span style={{ width: 40, height: 40, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 3,
            boxSizing: "border-box",
            border: lined ? "none" : `2px solid ${palette.onSurfaceVariant}`,
            background: lined ? palette.primary : "transparent",
            color: palette.onPrimary,
            display: "grid",
            placeItems: "center",
            transition: "background 140ms, border 140ms",
          }}
        >
          {on && !indeterminate && <Icon name="check" size={16} weight={700} />}
          {indeterminate && <Icon name="remove" size={16} weight={700} />}
        </span>
      </span>
      {label?.trim() && <span style={{ fontSize: 16, color: palette.onSurface, paddingRight: 8 }}>{label}</span>}
    </span>
  );
}

/* ---------- Radio ---------- */

export type RadioProps = {
  label?: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  /** 组名，同组内互斥（用原生 input 语义） */
  name?: string;
  style?: CSSProperties;
  className?: string;
};

/** M3 单选按钮 */
export function Radio({ label, checked = false, onChange, disabled, name, style, className }: RadioProps) {
  const { palette } = useMd3e();
  return (
    <span
      className={className}
      role="radio"
      aria-checked={checked}
      aria-label={label}
      data-radio-name={name}
      onClick={() => !disabled && onChange?.(true)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 40,
        whiteSpace: "nowrap",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.38 : 1,
        ...style,
      }}
    >
      <span style={{ width: 40, height: 40, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            boxSizing: "border-box",
            border: `2px solid ${checked ? palette.primary : palette.onSurfaceVariant}`,
            display: "grid",
            placeItems: "center",
            transition: "border 140ms",
          }}
        >
          {checked && <span style={{ width: 10, height: 10, borderRadius: 5, background: palette.primary }} />}
        </span>
      </span>
      {label?.trim() && <span style={{ fontSize: 16, color: palette.onSurface, paddingRight: 8 }}>{label}</span>}
    </span>
  );
}

/* ---------- Radio Group ---------- */

export type RadioGroupProps = {
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  style?: CSSProperties;
  className?: string;
};

/** 便捷的单选组：内部管理选中项 */
export function RadioGroup({ options, value, onChange, style, className }: RadioGroupProps) {
  const [inner, setInner] = useState(options[0]?.value);
  const cur = value !== undefined ? value : inner;
  return (
    <div className={className} role="radiogroup" style={{ display: "flex", flexDirection: "column", ...style }}>
      {options.map((o) => (
        <Radio
          key={o.value}
          label={o.label}
          checked={cur === o.value}
          onChange={() => {
            if (value === undefined) setInner(o.value);
            onChange?.(o.value);
          }}
        />
      ))}
    </div>
  );
}

/* ---------- Slider ---------- */

export type SliderProps = {
  /** 0..100 */
  value?: number;
  defaultValue?: number;
  onChange?: (v: number) => void;
  width?: number;
  disabled?: boolean;
  /** 是否显示右侧的停止指示点 */
  showStopIndicator?: boolean;
  style?: CSSProperties;
  className?: string;
};

/** M3 滑块：方形轨道 + 长条手柄（非圆形，符合 M3E 的表达性风格） */
export function Slider({
  value,
  defaultValue = 40,
  onChange,
  width = CONTENT_W,
  disabled,
  showStopIndicator = true,
  style,
  className,
}: SliderProps) {
  const { palette } = useMd3e();
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue);
  const v = Math.min(100, Math.max(0, controlled ? (value as number) : inner));
  const frac = v / 100;
  const handleX = 2 + (width - 4) * frac;

  const setFromClientX = (clientX: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left - 2) / Math.max(1, r.width - 4)));
    const next = Math.round(ratio * 100);
    if (!controlled) setInner(next);
    onChange?.(next);
  };

  return (
    <div
      className={className}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      onPointerDown={(e) => {
        if (disabled) return;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setFromClientX(e.clientX, e.currentTarget as HTMLElement);
      }}
      onPointerMove={(e) => {
        if (disabled) return;
        if (e.buttons !== 1) return;
        setFromClientX(e.clientX, e.currentTarget as HTMLElement);
      }}
      style={{
        position: "relative",
        width,
        height: 44,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.38 : 1,
        touchAction: "none",
        ...style,
      }}
    >
      {/* 已走过的轨道 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: Math.max(0, handleX - 8),
          top: 14,
          height: 16,
          borderRadius: "8px 2px 2px 8px",
          background: palette.primary,
        }}
      />
      {/* 剩余轨道 */}
      <div
        style={{
          position: "absolute",
          left: handleX + 8,
          right: 0,
          top: 14,
          height: 16,
          borderRadius: "2px 8px 8px 2px",
          background: palette.secondaryContainer,
        }}
      />
      {showStopIndicator && (
        <div
          style={{
            position: "absolute",
            right: 6,
            top: 20,
            width: 4,
            height: 4,
            borderRadius: 2,
            background: palette.onSecondaryContainer,
          }}
        />
      )}
      {/* 手柄 */}
      <div
        style={{
          position: "absolute",
          left: handleX - 2,
          top: 0,
          width: 4,
          height: 44,
          borderRadius: 2,
          background: palette.primary,
          transition: "left 60ms linear",
        }}
      />
    </div>
  );
}

export type { ColorToken };
