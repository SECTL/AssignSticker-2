"use client";

/** Chip：可选中 / 可点击的标签。样式取自 m3e-canvas `M3Node.tsx` 的 ChipContent 与 boxStyle。 */

import type { CSSProperties } from "react";
import { Icon } from "./Icon";
import { Pressable } from "./Pressable";
import { useMd3e } from "./theme";
import { chipMetrics, CHIP_H_MAX, CHIP_H_MIN, scaleR, Variant } from "./tokens";

export type ChipProps = {
  label: string;
  /** 未选中时显示的图标；选中时自动换成对勾 */
  icon?: string;
  variant?: Variant;
  /** 高度 32..56dp */
  size?: number;
  /** 选中态（受控） */
  checked?: boolean;
  /** 非受控初始值 */
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
};

/** M3 输入／筛选 Chip */
export function Chip({
  label,
  icon,
  variant = "outlined",
  size = 32,
  checked,
  defaultChecked,
  onChange,
  onClick,
  disabled,
  style,
  className,
}: ChipProps) {
  const { palette } = useMd3e();
  const h = Math.min(CHIP_H_MAX, Math.max(CHIP_H_MIN, Math.round(size)));
  const m = chipMetrics(h);
  const controlled = checked !== undefined;
  const on = controlled ? !!checked : !!defaultChecked;
  const lead = on ? "check" : icon;

  /* 选中：secondaryContainer 填充；未选中：outlined 描边 或 浅面填充 */
  const st: CSSProperties = on
    ? { background: palette.secondaryContainer, color: palette.onSecondaryContainer, border: "none" }
    : variant === "outlined"
      ? { background: "transparent", color: palette.onSurfaceVariant, border: `1px solid ${palette.outlineVariant}` }
      : { background: palette.surfaceContainerLow, color: palette.onSurfaceVariant, border: "none" };

  return (
    <Pressable
      palette={palette}
      variant={variant}
      disabled={disabled}
      aria-pressed={on}
      style={{
        ...st,
        height: m.h,
        width: "fit-content",
        borderRadius: scaleR(h / 2),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ["--md3e-press-scale" as any]: 0.95,
        ...style,
      }}
      className={`m3-size-ease ${className ?? ""}`.trim()}
      onClick={(e) => {
        if (!controlled) onChange?.(!on);
        else onChange?.(!on);
        onClick?.(e);
      }}
    >
      <span
        className="m3-size-ease"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: m.gap,
          paddingLeft: lead ? m.lead : m.padX,
          paddingRight: m.padX,
          height: m.h,
          fontSize: m.font,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {lead && <Icon name={lead} size={m.icon} />}
        <span>{label}</span>
      </span>
    </Pressable>
  );
}
