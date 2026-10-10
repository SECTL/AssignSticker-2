"use client";

/**
 * M3 按下涟漪。
 * 移植自 m3e-canvas `components/M3Node.tsx` 的 Ripple 部分，
 * 但把 framer-motion 的动画换成 CSS 关键帧（见 md3e.css 的 .md3-ripple）。
 *
 * 行为：从触点向外扩张到覆盖整个形状，颜色取形状上文字的颜色；
 * 手指抬起后淡出，而不是瞬间消失。
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type Ripple = {
  id: number;
  /** 形状由多个部件拼成时，指出是哪一个（如 split button 的两段） */
  part: string | null;
  x: number;
  y: number;
  d: number;
  /** 起始缩放：从别处接手的光要接着此前的进度 */
  from?: number;
  /** 还剩多久长完（秒） */
  dur?: number;
  /** 已开始淡出 */
  out?: boolean;
};

/** 涟漪铺满形状所需时间（秒） */
export const RIPPLE_GROW = 0.42;
/** 淡出时间（毫秒） */
const RIPPLE_OUT_MS = 300;

/** 从触点出发，覆盖整个矩形所需的直径 */
export function rippleSize(r: { width: number; height: number }, x: number, y: number): number {
  return (
    2 *
    Math.max(
      Math.hypot(x, y),
      Math.hypot(r.width - x, y),
      Math.hypot(x, r.height - y),
      Math.hypot(r.width - x, r.height - y),
    )
  );
}

/** 涟漪本身。调用方负责给它一个裁剪容器与圆角。 */
export function Ripples({ list, color }: { list: Ripple[]; color: string }) {
  return (
    <>
      {list.map((r) => (
        <span
          key={r.id}
          aria-hidden
          className={r.out ? "md3-ripple out" : "md3-ripple"}
          style={
            {
              left: r.x - r.d / 2,
              top: r.y - r.d / 2,
              width: r.d,
              height: r.d,
              background: color,
              "--md3-ripple-from": r.from ?? 0,
              "--md3-ripple-dur": `${r.dur ?? RIPPLE_GROW}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

/** 部件被按下时点亮了什么，供深处画出来的形状读取 */
const RippleCtx = createContext<{ list: Ripple[]; color: string } | null>(null);

export function RippleProvider({ list, color, children }: { list: Ripple[]; color: string; children: ReactNode }) {
  return <RippleCtx.Provider value={{ list, color }}>{children}</RippleCtx.Provider>;
}

/** 一个部件内部某个形状里的光：形状自己裁剪它并保持圆角 */
export function RippleShape({ part }: { part: string | null }) {
  const ctx = useContext(RippleCtx);
  if (!ctx) return null;
  return (
    <span aria-hidden className="md3-ripple-clip">
      <Ripples list={ctx.list.filter((r) => r.part === part)} color={ctx.color} />
    </span>
  );
}

export type RippleApi = {
  list: Ripple[];
  /** 在 pointerdown 上调用 */
  add: (e: React.PointerEvent) => void;
  /** 立刻收掉 */
  end: () => void;
};

/** 一个部件正在按住的触点，以及每个触点落在哪儿 */
export function useRipples(on: boolean): RippleApi {
  const [list, setList] = useState<Ripple[]>([]);
  const next = useRef(0);
  /** 光在手指按住期间一直留着，松手才淡出；释放监听见在 window 上，因为拖拽结束在那里 */
  const waiting = useRef<(() => void) | null>(null);
  const timers = useRef<number[]>([]);

  const end = useCallback(() => {
    waiting.current?.();
    setList((rs) => {
      if (!rs.length) return rs;
      return rs.map((r) => ({ ...r, out: true }));
    });
    const id = window.setTimeout(() => setList((rs) => (rs.length ? [] : rs)), RIPPLE_OUT_MS);
    timers.current.push(id);
  }, []);

  const add = useCallback(
    (e: React.PointerEvent) => {
      if (!on) return;
      /* 只有鼠标主键才算按下 */
      if (e.pointerType === "mouse" && e.button !== 0) return;
      /* 由多个形状拼成的部件要说明按在哪个形状上 */
      const seg = (e.target as HTMLElement | null)?.closest?.("[data-part-shape]") as HTMLElement | null;
      const el = seg ?? (e.currentTarget as HTMLElement);
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      setList((rs) => [...rs.filter((q) => !q.out), { id: ++next.current, part: seg?.dataset.partShape ?? null, x, y, d: rippleSize(r, x, y) }]);
      waiting.current?.();
      const done = () => {
        waiting.current = null;
        window.removeEventListener("pointerup", done);
        window.removeEventListener("pointercancel", done);
        setList((rs) => rs.map((q) => ({ ...q, out: true })));
        const id = window.setTimeout(() => setList((rs) => (rs.length ? [] : rs)), RIPPLE_OUT_MS);
        timers.current.push(id);
      };
      waiting.current = done;
      window.addEventListener("pointerup", done);
      window.addEventListener("pointercancel", done);
    },
    [on],
  );

  /* 部件在按住时被移除，不该留下监听器 */
  useEffect(
    () => () => {
      waiting.current?.();
      timers.current.forEach((id) => clearTimeout(id));
    },
    [],
  );

  return { list, add, end };
}
