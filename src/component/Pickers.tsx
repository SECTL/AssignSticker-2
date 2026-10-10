"use client";

/**
 * 选择器：DatePicker / TimePicker。
 * 移植自 m3e-canvas `components/Pickers.tsx`，并把「只读的今天」改成可交互选择。
 */

import { useMemo, useState, type CSSProperties } from "react";
import { Icon } from "./Icon";
import { useMd3e } from "./theme";
import { CARD_PADDING, scaleR } from "./tokens";

export type DateLayout = "modal" | "docked" | "input";
export type TimeLayout = "dial" | "input";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

/* ---------- Date Picker ---------- */

export type DatePickerProps = {
  layout?: DateLayout;
  /** 受控日期 */
  value?: Date;
  onChange?: (d: Date) => void;
  width?: number;
  onCancel?: () => void;
  onConfirm?: (d: Date) => void;
  style?: CSSProperties;
  className?: string;
};

/** M3 日期选择器（模态 / 停靠 / 输入框三种形态） */
export function DatePicker({
  layout = "modal",
  value,
  onChange,
  width = 328,
  onCancel,
  onConfirm,
  style,
  className,
}: DatePickerProps) {
  const { palette } = useMd3e();
  const [inner, setInner] = useState(() => new Date());
  const at = value ?? inner;
  const setAt = (d: Date) => {
    if (value === undefined) setInner(d);
    onChange?.(d);
  };

  const cell = Math.round((width - 48) / 7);
  const days = new Date(at.getFullYear(), at.getMonth() + 1, 0).getDate();
  const offset = new Date(at.getFullYear(), at.getMonth(), 1).getDay();
  const cells = Array.from({ length: 42 }, (_, i) => (i < offset || i - offset >= days ? null : i - offset + 1));
  const headline = `${at.getFullYear()}年${at.getMonth() + 1}月${at.getDate()}日`;

  if (layout === "input") {
    return (
      <div className={className} style={{ width, background: "transparent", ...style }}>
        <div style={{ fontSize: 12, color: palette.onSurfaceVariant, marginBottom: 6 }}>选择日期</div>
        <div
          style={{
            height: 56,
            borderRadius: 4,
            border: `1px solid ${palette.outline}`,
            display: "flex",
            alignItems: "center",
            padding: "0 12px 0 16px",
            gap: 8,
            color: palette.onSurface,
            fontSize: 16,
          }}
        >
          <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{headline}</span>
          <Icon name="calendar_month" size={22} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width,
        background: palette.surfaceContainerHigh,
        color: palette.onSurface,
        borderRadius: scaleR(28),
        boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        paddingBottom: 12,
        ...style,
      }}
    >
      {layout === "modal" && (
        <div style={{ padding: "16px 24px 0" }}>
          <div style={{ fontSize: 12, color: palette.onSurfaceVariant }}>选择日期</div>
          <div style={{ fontSize: 28, fontWeight: 500, marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {headline}
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${layout === "docked" ? 16 : 8}px 16px 0 24px`,
          color: palette.onSurfaceVariant,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: palette.onSurface, display: "inline-flex", alignItems: "center", gap: 4 }}>
          {at.getFullYear()}年{at.getMonth() + 1}月
          <Icon name="arrow_drop_down" size={20} />
        </span>
        <span style={{ display: "inline-flex", gap: 12 }}>
          <span
            role="button"
            aria-label="上个月"
            style={{ cursor: "pointer", display: "grid", placeItems: "center" }}
            onClick={() => setAt(new Date(at.getFullYear(), at.getMonth() - 1, at.getDate()))}
          >
            <Icon name="chevron_left" size={20} />
          </span>
          <span
            role="button"
            aria-label="下个月"
            style={{ cursor: "pointer", display: "grid", placeItems: "center" }}
            onClick={() => setAt(new Date(at.getFullYear(), at.getMonth() + 1, at.getDate()))}
          >
            <Icon name="chevron_right" size={20} />
          </span>
        </span>
      </div>

      <div style={{ padding: "4px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {WEEKDAYS.map((d, i) => (
            <span
              key={i}
              style={{ height: cell, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, color: palette.onSurfaceVariant }}
            >
              {d}
            </span>
          ))}
          {cells.map((d, i) => (
            <span key={i} style={{ height: cell, display: "grid", placeItems: "center" }}>
              {d !== null && (
                <span
                  role="button"
                  onClick={() => setAt(new Date(at.getFullYear(), at.getMonth(), d))}
                  style={{
                    width: cell - 4,
                    height: cell - 4,
                    borderRadius: (cell - 4) / 2,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 13,
                    fontWeight: d === at.getDate() ? 700 : 500,
                    background: d === at.getDate() ? palette.primary : "transparent",
                    color: d === at.getDate() ? palette.onPrimary : palette.onSurface,
                    cursor: "pointer",
                  }}
                >
                  {d}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "0 12px" }}>
        <PickerAction label="取消" onClick={onCancel} />
        <PickerAction label="确定" onClick={() => onConfirm?.(at)} />
      </div>
    </div>
  );
}

function PickerAction({ label, onClick }: { label: string; onClick?: () => void }) {
  const { palette } = useMd3e();
  return (
    <span
      className="md3e-text-action"
      onClick={onClick}
      style={{
        height: 40,
        padding: "0 12px",
        borderRadius: 20,
        color: palette.primary,
        fontSize: 14,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      {label}
    </span>
  );
}

/* ---------- Time Picker ---------- */

export type TimePickerProps = {
  layout?: TimeLayout;
  /** 24 小时制的小时 */
  hour?: number;
  minute?: number;
  onChange?: (hour: number, minute: number) => void;
  width?: number;
  onCancel?: () => void;
  onConfirm?: (hour: number, minute: number) => void;
  style?: CSSProperties;
  className?: string;
};

/** M3 时间选择器（表盘 / 键盘输入） */
export function TimePicker({
  layout = "dial",
  hour,
  minute,
  onChange,
  width = 328,
  onCancel,
  onConfirm,
  style,
  className,
}: TimePickerProps) {
  const { palette } = useMd3e();
  const [inner, setInner] = useState({ h: 10, m: 30 });
  const h24 = hour ?? inner.h;
  const m = minute ?? inner.m;
  const setTime = (nh: number, nm: number) => {
    if (hour === undefined || minute === undefined) setInner({ h: nh, m: nm });
    onChange?.(nh, nm);
  };
  const pm = h24 >= 12;
  const hh = String(h24 % 12 || 12).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const plate = Math.max(0, Math.min(96, Math.round((width - CARD_PADDING * 2 - 60) / 2)));
  const dial = Math.min(256, width - 48);

  return (
    <div
      className={className}
      style={{
        width,
        background: palette.surfaceContainerHigh,
        color: palette.onSurface,
        borderRadius: scaleR(28),
        boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        paddingBottom: 12,
        ...style,
      }}
    >
      <div style={{ padding: "16px 24px 0", fontSize: 12, color: palette.onSurfaceVariant }}>选择时间</div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 24px 0" }}>
        <TimeBox text={hh} on p={palette} wide={plate} />
        <span style={{ fontSize: 32 }}>:</span>
        <TimeBox text={mm} on={false} p={palette} wide={plate} />
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            width: 48,
            height: 72,
            borderRadius: 8,
            border: `1px solid ${palette.outline}`,
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={() => setTime(pm ? h24 - 12 : h24 + 12, m)}
        >
          {["AM", "PM"].map((s) => {
            const on = (s === "PM") === pm;
            return (
              <span
                key={s}
                style={{
                  flex: 1,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  background: on ? palette.tertiaryContainer : "transparent",
                  color: on ? palette.onTertiaryContainer : palette.onSurfaceVariant,
                }}
              >
                {s}
              </span>
            );
          })}
        </span>
      </div>

      {layout === "dial" ? (
        <div style={{ display: "grid", placeItems: "center", padding: "12px 0" }}>
          <Dial hour24={h24} p={palette} size={dial} onPick={(h) => setTime(h, m)} />
        </div>
      ) : (
        <div style={{ display: "grid", placeItems: "center", padding: "16px 24px 8px", gap: 12 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <NumberField
              value={hh}
              label="时"
              min={1}
              max={12}
              onChange={(v) => setTime((v % 12) + (pm ? 12 : 0), m)}
            />
            <NumberField value={mm} label="分" min={0} max={59} onChange={(v) => setTime(h24, v)} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", padding: "0 12px" }}>
        <Icon name={layout === "dial" ? "keyboard" : "schedule"} size={22} color={palette.onSurfaceVariant} />
        <span style={{ flex: 1 }} />
        <PickerAction label="取消" onClick={onCancel} />
        <PickerAction label="确定" onClick={() => onConfirm?.(h24, m)} />
      </div>
    </div>
  );
}

function NumberField({
  value,
  label,
  min,
  max,
  onChange,
}: {
  value: string;
  label: string;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const { palette } = useMd3e();
  const [text, setText] = useState(value);
  useMemo(() => setText(value), [value]);
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
      <span style={{ fontSize: 12, color: palette.onSurfaceVariant }}>{label}</span>
      <input
        value={text}
        inputMode="numeric"
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
          setText(v);
          const n = Number(v);
          if (!Number.isNaN(n) && n >= min && n <= max) onChange(n);
        }}
        style={{
          width: 72,
          height: 48,
          textAlign: "center",
          fontSize: 24,
          borderRadius: 8,
          border: `1px solid ${palette.outline}`,
          background: "transparent",
          color: palette.onSurface,
          fontFamily: "inherit",
          outline: "none",
        }}
      />
    </label>
  );
}

function TimeBox({ text, on, p, wide }: { text: string; on: boolean; p: ReturnType<typeof useMd3e>["palette"]; wide: number }) {
  return (
    <span
      style={{
        width: wide,
        height: 72,
        borderRadius: 8,
        display: "grid",
        placeItems: "center",
        background: on ? p.primaryContainer : p.surfaceContainerHighest,
        color: on ? p.onPrimaryContainer : p.onSurface,
        fontSize: 40,
        fontWeight: 400,
        border: on ? `2px solid ${p.primary}` : "none",
        boxSizing: "border-box",
      }}
    >
      {text}
    </span>
  );
}

/** 表盘：12 个数字围成一圈，一根指针指向当前小时 */
function Dial({
  hour24,
  p,
  size,
  onPick,
}: {
  hour24: number;
  p: ReturnType<typeof useMd3e>["palette"];
  size: number;
  onPick?: (hour24: number) => void;
}) {
  const hour = hour24 % 12 || 12;
  const R = size / 2;
  const ring = R - 20;
  const angle = ((hour % 12) / 12) * Math.PI * 2 - Math.PI / 2;
  const hx = R + Math.cos(angle) * ring;
  const hy = R + Math.sin(angle) * ring;
  const pm = hour24 >= 12;
  return (
    <div
      style={{ width: size, height: size, borderRadius: R, background: p.surfaceContainerHighest, position: "relative" }}
      onClick={(e) => {
        if (!onPick) return;
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const dx = e.clientX - r.left - R;
        const dy = e.clientY - r.top - R;
        let a = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        if (a < 0) a += 360;
        const n = Math.round(a / 30) % 12 || 12;
        onPick((n % 12) + (pm ? 12 : 0));
      }}
    >
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <line x1={R} y1={R} x2={hx} y2={hy} stroke={p.primary} strokeWidth={2} />
        <circle cx={R} cy={R} r={3} fill={p.primary} />
        <circle cx={hx} cy={hy} r={20} fill={p.primary} />
      </svg>
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const a = (n / 12) * Math.PI * 2 - Math.PI / 2;
        const on = n === hour;
        return (
          <span
            key={n}
            style={{
              position: "absolute",
              left: R + Math.cos(a) * ring - 20,
              top: R + Math.sin(a) * ring - 20,
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              fontSize: 15,
              fontWeight: on ? 700 : 500,
              color: on ? p.onPrimary : p.onSurface,
              pointerEvents: "none",
            }}
          >
            {n}
          </span>
        );
      })}
    </div>
  );
}
