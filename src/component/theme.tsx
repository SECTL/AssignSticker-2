"use client";

/**
 * MD3E 主题上下文。
 * 移植自 m3e-canvas `lib/theme.ts`，但把主题状态收进一个 Provider：
 * 调色板、深浅色、对比度、形状刻度、强调字重都由它下发。
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Contrast,
  PALETTES,
  Palette,
  ShapeScale,
  Theme,
  DEFAULT_THEME,
  MotionScheme,
  paletteOf,
  setGlobalShape,
} from "./tokens";

export type Md3eThemeProps = {
  /** 预设配色的 key，或 "custom" */
  palette?: string;
  /** palette 为 "custom" 时使用的自定义方案 */
  customPalette?: Palette | null;
  dark?: boolean;
  contrast?: Contrast;
  shape?: ShapeScale;
  emphasized?: boolean;
  motion?: MotionScheme;
  /** 正文字体族，默认 MiSans / Roboto */
  fontFamily?: string;
  children?: ReactNode;
};

type Md3eContext = {
  theme: Theme;
  palette: Palette;
  paletteKey: string;
  set: (patch: Partial<Md3eThemeProps>) => void;
};

const Ctx = createContext<Md3eContext | null>(null);

export function Md3eProvider({
  palette = "purple",
  customPalette = null,
  dark = DEFAULT_THEME.dark,
  contrast = DEFAULT_THEME.contrast,
  shape = DEFAULT_THEME.shape,
  emphasized = DEFAULT_THEME.emphasized,
  motion = DEFAULT_THEME.motion,
  fontFamily,
  children,
}: Md3eThemeProps) {
  const [state, setState] = useState<Md3eThemeProps>({
    palette,
    customPalette,
    dark,
    contrast,
    shape,
    emphasized,
    motion,
    fontFamily,
  });

  // 外部 props 变化时同步（受控用法）
  useEffect(() => {
    setState({ palette, customPalette, dark, contrast, shape, emphasized, motion, fontFamily });
  }, [palette, customPalette, dark, contrast, shape, emphasized, motion, fontFamily]);

  const theme: Theme = {
    dark: !!state.dark,
    contrast: state.contrast ?? "standard",
    shape: state.shape ?? "rounded",
    emphasized: !!state.emphasized,
    motion: state.motion ?? "standard",
  };

  // 渲染辅助函数（React 之外）通过全局形状刻度读取
  setGlobalShape(theme.shape);

  const p = useMemo(
    () => paletteOf(state.palette ?? "purple", state.customPalette ?? null, theme),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.palette, state.customPalette, theme.dark, theme.contrast],
  );

  const value: Md3eContext = {
    theme,
    palette: p,
    paletteKey: state.palette ?? "purple",
    set: (patch) => setState((s) => ({ ...s, ...patch })),
  };

  return (
    <Ctx.Provider value={value}>
      <div
        className="md3e-root"
        data-md3e-dark={theme.dark ? "true" : undefined}
        data-md3e-shape={theme.shape}
        style={{
          // 把当前方案也下发成 CSS 变量，方便自定义样式与过渡使用
          ["--md3e-primary" as string]: p.primary,
          ["--md3e-on-primary" as string]: p.onPrimary,
          ["--md3e-surface" as string]: p.surface,
          ["--md3e-surface-container" as string]: p.surfaceContainer,
          ["--md3e-on-surface" as string]: p.onSurface,
          ["--md3e-outline" as string]: p.outline,
          ...(state.fontFamily ? { fontFamily: state.fontFamily } : null),
        }}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

/** 当前的 MD3E 主题（调色板 + 各轴）。必须在 Md3eProvider 内使用。 */
export function useMd3e(): Md3eContext {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMd3e 必须在 <Md3eProvider> 内使用");
  return v;
}

/** 只取调色板 */
export const usePalette = () => useMd3e().palette;

/** 只取主题配置 */
export const useTheme = () => useMd3e().theme;

/** 标题与标签的字重：emphasized 时更重 */
export function useWeight() {
  const emphasized = useMd3e().theme.emphasized;
  return (normal: number, strong: number) => (emphasized ? strong : normal);
}

export { PALETTES };
