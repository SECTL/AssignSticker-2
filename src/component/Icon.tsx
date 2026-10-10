"use client";

/**
 * Material Symbols Outlined 图标（与应用内 md-icon 风格一致）。
 * 用连字方式渲染：<Icon name="add" /> → <span class="msr">add</span>。
 * 字体由 `md3e.css` 引入（Google Fonts 可变字体）。
 */

export type IconProps = {
  /** Material Symbols 的连字名，例如 "add"、"check"、"chevron_right" */
  name: string;
  size?: number;
  color?: string;
  /** 填充变体（选中态常用） */
  fill?: boolean;
  /** 字重 400..700 */
  weight?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function Icon({ name, size = 24, color, fill, weight, className, style }: IconProps) {
  return (
    <span
      className={className ? `msr ${className}` : "msr"}
      /* 连字是一张图，不是单词：读屏软件不该把名字拼出来 */
      aria-hidden
      data-fill={fill ? "1" : "0"}
      style={{
        fontSize: size,
        color,
        ...(weight
          ? { fontVariationSettings: `"FILL" ${fill ? 1 : 0}, "wght" ${weight}, "GRAD" 0, "opsz" 24` }
          : null),
        ...style,
      }}
    >
      {name}
    </span>
  );
}
