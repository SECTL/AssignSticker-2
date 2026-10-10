"use client";

/**
 * 连通组（connected run）与吸附条件。
 * ------------------------------------------------------------------
 * 移植自 m3e-canvas：
 *   - `lib/tokens.ts`：连通规格 connectSpecOf / canJoin / matchRunSize / explodeGroup / runCorners
 *   - `app/Editor.tsx`：磁铁 restPos / findSnap / holdGap / runRadii / guideFor
 *
 * 一个部件要"吸"进一条 run，必须同时满足四个条件：
 *   1. 部件本身可连接（kind 在 CONNECT_SPECS 里）；
 *   2. 目标 run 与它同轴 —— 按钮沿 x 排、列表项沿 y 堆；
 *   3. 两者同族 —— 按钮与图标按钮算一族；chip、列表项各自成族（所以按钮吸不到 chip 上）；
 *   4. 松手时指针落进磁吸场：沿 run 方向 |Δ| < SNAP_MAIN(44dp)，跨 run 方向 |Δ| < SNAP_CROSS(24dp)，
 *      拉力 pull = (1 - 归一化距离) ^ PULL_EXP，从场边缘的 0 连续长到落点上的 1。
 * 另外两条否决项：按住 Ctrl / Cmd 期间不吸附；locked 的 run 不接受任何新部件。
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "./Buttons";
import { Chip } from "./Chip";
import { ListItem } from "./Containment";
import { useMd3e } from "./theme";
import {
  CHIP_H_MIN,
  CONTENT_W,
  GAP,
  GUIDE_PX,
  lerp,
  PULL_EXP,
  R_FULL,
  R_INNER,
  runCorners,
  scaleR,
  SETTLE_MS,
  SNAP_CROSS,
  SNAP_MAIN,
  type Axis,
  type ColorToken,
  type ConnectSpec,
  type Palette,
  type Radii,
  type Variant,
} from "./tokens";

/* ============================================================
 * 1. 连通规格
 * ============================================================ */

export type ConnectKind = "button" | "iconButton" | "chip" | "listItem";

/** 每种部件连起来时的轴、外/内圆角，以及"和谁是一族" */
export const CONNECT_SPECS: Record<ConnectKind, ConnectSpec> = {
  button: { axis: "x", outer: R_FULL, inner: R_INNER, family: "button" },
  iconButton: { axis: "x", outer: 24, inner: R_INNER, family: "button" },
  chip: { axis: "x", outer: CHIP_H_MIN / 2, inner: 4, family: "chip" },
  listItem: { axis: "y", outer: R_FULL, inner: R_INNER, family: "list" },
};

export type ConnectItem = {
  id: string;
  kind: ConnectKind;
  label?: string;
  icon?: string;
  supportingText?: string;
  variant?: Variant;
  /** 列表项的底色角色 */
  fill?: ColorToken;
  /** 沿轴尺寸：横向 run 的宽，纵向 run 的高 */
  main?: number;
  /** 跨轴尺寸：横向 run 的高，纵向 run 的宽 */
  cross?: number;
};

export type ConnectRun = {
  id: string;
  axis: Axis;
  x: number;
  y: number;
  items: ConnectItem[];
  /** 自由摆放：各留各的偏移，不参与磁铁 */
  free?: boolean;
  /** 作者锁定的成品：仍然可选，但不接受新部件，也不会被挪开让位 */
  locked?: boolean;
  /** free 时每个部件相对 run 的偏移 */
  pos?: Record<string, { x: number; y: number }>;
};

/** 吸附结果：落进哪条 run 的第几个槽位，以及拉力有多大 */
export type Snap = { groupId: string; index: number; pull: number };
/** 对齐参考线：命中后的坐标，与线要画在哪里 */
export type Guide = { x?: number; y?: number; gx?: number; gy?: number };
export type Placed = { item: ConnectItem; index: number; x: number; y: number; w: number; h: number };
export type Size = { w: number; h: number };

const DEFAULT_MAIN: Record<ConnectKind, number> = { button: 96, iconButton: 48, chip: 84, listItem: 72 };
const DEFAULT_CROSS: Record<ConnectKind, number> = { button: 56, iconButton: 48, chip: 32, listItem: CONTENT_W };

/** 部件的两个尺寸：main 沿 run，cross 跨 run */
export function sizeOf(it: ConnectItem): Size {
  const main = it.main ?? DEFAULT_MAIN[it.kind];
  const cross = it.cross ?? DEFAULT_CROSS[it.kind];
  return CONNECT_SPECS[it.kind].axis === "x" ? { w: main, h: cross } : { w: cross, h: main };
}
export const alongOf = (it: ConnectItem, axis: Axis) => (axis === "x" ? sizeOf(it).w : sizeOf(it).h);
export const acrossOf = (it: ConnectItem, axis: Axis) => (axis === "x" ? sizeOf(it).h : sizeOf(it).w);

/**
 * 一个部件的连通规格。外圆角跟着部件自己的高度走：
 * 按钮、图标按钮、chip 是一条 run 的两端，端头永远和部件一样圆 —— 更矮的部件配更小的外圆角。
 */
export function connectSpecOf(it: ConnectItem): ConnectSpec | undefined {
  const c = CONNECT_SPECS[it.kind];
  if (!c) return undefined;
  const sz = sizeOf(it);
  const own = it.kind === "button" || it.kind === "iconButton" || it.kind === "chip" ? sz.h / 2 : c.outer;
  return { ...c, outer: scaleR(own), inner: scaleR(c.inner) };
}

export const connectable = (it: ConnectItem) => !!CONNECT_SPECS[it.kind];

/** 两个部件融合的条件之一：同轴，且同族（按钮与图标按钮同族） */
export function canJoin(a: ConnectItem, b: ConnectItem): boolean {
  const sa = connectSpecOf(a);
  const sb = connectSpecOf(b);
  return !!sa && !!sb && sa.axis === sb.axis && sa.family === sb.family;
}

/**
 * 静止的那条 run 定尺寸：飞在手上的部件一旦进入它的磁吸场，就取它的跨轴尺寸，
 * 这样整条 run 读起来是一条带子，而不是一列台阶。
 */
export function matchRunSize(it: ConnectItem, host: ConnectItem): ConnectItem {
  const sa = connectSpecOf(it);
  const sb = connectSpecOf(host);
  if (!sa || !sb || sa.family !== sb.family) return it;
  const want = acrossOf(host, sa.axis);
  return acrossOf(it, sa.axis) === want ? it : { ...it, cross: want };
}

/* ============================================================
 * 2. 排布与槽位
 * ============================================================ */

/** 一条 run 里每个部件的世界坐标（自由组按它自己的偏移） */
export function layoutOfRun(run: ConnectRun): Placed[] {
  if (run.free) {
    return run.items.map((it, index) => {
      const sz = sizeOf(it);
      const o = run.pos?.[it.id] ?? { x: 0, y: 0 };
      return { item: it, index, x: run.x + o.x, y: run.y + o.y, w: sz.w, h: sz.h };
    });
  }
  let off = 0;
  return run.items.map((it, index) => {
    const sz = sizeOf(it);
    const p = run.axis === "x" ? { x: run.x + off, y: run.y } : { x: run.x, y: run.y + off };
    off += (run.axis === "x" ? sz.w : sz.h) + GAP;
    return { item: it, index, ...p, w: sz.w, h: sz.h };
  });
}

/** 前 k 个部件加它们之间的间距：run 的锚点始终是第一个部件的左上角 */
export const prefixOf = (run: ConnectRun, k: number) =>
  run.items.slice(0, k).reduce((s, it) => s + alongOf(it, run.axis) + GAP, 0);

/** 一条 run 有多长 */
export const runSpan = (run: ConnectRun) =>
  run.items.reduce((s, it) => s + alongOf(it, run.axis), 0) + GAP * Math.max(0, run.items.length - 1);

/** 一个部件要落进这条 run 时，第 k 个槽位的落点 */
export function restPosOf(run: ConnectRun, k: number, sz: Size): { left: number; top: number } {
  return run.axis === "x"
    ? { left: k === 0 ? run.x - sz.w - GAP : run.x + prefixOf(run, k), top: run.y }
    : { left: run.x, top: k === 0 ? run.y - sz.h - GAP : run.y + prefixOf(run, k) };
}

/** run 的跨轴宽度：判断磁吸场时按它居中 */
export const runBand = (run: ConnectRun) => run.items.reduce((m, it) => Math.max(m, acrossOf(it, run.axis)), 0);

/* ============================================================
 * 3. 磁铁
 * ============================================================ */

/**
 * 磁吸场里最近的槽位：吸引力从边缘的 0 渐变到落点上的 1。
 * 一个部件只与自己的同类融合 —— 族不同、轴不同、已锁定、自由摆放的 run，一律跳过。
 * 返回 null 就是"不吸附"，部件落回指针所在的位置。
 */
export function findSnap(item: ConnectItem, left: number, top: number, runs: ConnectRun[]): Snap | null {
  const spec = connectSpecOf(item);
  if (!spec) return null;
  const sz = sizeOf(item);
  let best: Snap | null = null;
  let bestD = 1;

  for (const g of runs) {
    if (g.free || g.locked || g.axis !== spec.axis || !g.items[0] || !canJoin(g.items[0], item)) continue;
    const band = runBand(g);
    for (let k = 0; k <= g.items.length; k++) {
      const r = restPosOf(g, k, sz);
      const dx = left - r.left;
      const dy = top - r.top;
      /* 跨轴按中线对齐：矮的部件拖到高的 run 上也能找到它，落下去时再取 run 的尺寸 */
      const mid = spec.axis === "x" ? top + sz.h / 2 - (g.y + band / 2) : left + sz.w / 2 - (g.x + band / 2);
      const nMain = (spec.axis === "x" ? dx : dy) / SNAP_MAIN;
      const nCross = mid / SNAP_CROSS;
      if (Math.abs(nMain) >= 1 || Math.abs(nCross) >= 1) continue;
      const d = Math.hypot(nMain, nCross);
      if (d < bestD) {
        bestD = d;
        best = { groupId: g.id, index: k, pull: Math.pow(1 - d, PULL_EXP) };
      }
    }
  }
  return best;
}

/** 磁吸场的矩形：沿轴 ±SNAP_MAIN，跨轴 ±SNAP_CROSS。落点在它正中。 */
export function fieldOf(run: ConnectRun, k: number, item: ConnectItem) {
  const sz = sizeOf(item);
  const r = restPosOf(run, k, sz);
  const axis = run.axis;
  return {
    field: {
      x: axis === "x" ? r.left - SNAP_MAIN : r.left - SNAP_CROSS,
      y: axis === "x" ? r.top - SNAP_CROSS : r.top - SNAP_MAIN,
      w: axis === "x" ? sz.w + SNAP_MAIN * 2 : sz.w + SNAP_CROSS * 2,
      h: axis === "x" ? sz.h + SNAP_CROSS * 2 : sz.h + SNAP_MAIN * 2,
    },
    rest: { ...r, w: sz.w, h: sz.h },
  };
}

/** Canva 式对齐：邻近部件的边缘与中线把部件轻轻拉齐，并画一条参考线 */
export function findGuide(item: ConnectItem, left: number, top: number, runs: ConnectRun[], tol = GUIDE_PX): Guide | null {
  const sz = sizeOf(item);
  const xs: number[] = [];
  const ys: number[] = [];
  for (const g of runs) {
    for (const pl of layoutOfRun(g)) {
      if (pl.item.id === item.id) continue;
      xs.push(pl.x, pl.x + pl.w / 2, pl.x + pl.w);
      ys.push(pl.y, pl.y + pl.h / 2, pl.y + pl.h);
    }
  }
  const mine = (pos: number, len: number) => [pos, pos + len / 2, pos + len];
  let best: Guide = {};
  let bx = tol;
  for (const c of xs) {
    for (const m of mine(left, sz.w)) {
      const d = Math.abs(c - m);
      if (d < bx) {
        bx = d;
        best = { ...best, x: left + (c - m), gx: c };
      }
    }
  }
  let by = tol;
  for (const c of ys) {
    for (const m of mine(top, sz.h)) {
      const d = Math.abs(c - m);
      if (d < by) {
        by = d;
        best = { ...best, y: top + (c - m), gy: c };
      }
    }
  }
  return best.x === undefined && best.y === undefined ? null : best;
}

/* ============================================================
 * 4. 圆角：随拉力连续变化
 * ============================================================ */

/**
 * 一条 run 里某个部件的圆角：两端保持外圆角；挨着"空位"的那一侧用软圆角，
 * 半径随拉力 pull 从外圆角连续插值到内圆角 —— 部件飞过来的过程中，run 的缺口是"呼吸"的。
 */
export function runRadii(
  axis: Axis,
  first: boolean,
  last: boolean,
  prevPh: boolean,
  nextPh: boolean,
  pull: number,
  outer: number,
  inner: number,
): Radii {
  const soft = lerp(outer, inner, pull);
  const s = first ? outer : prevPh ? soft : inner;
  const e = last ? outer : nextPh ? soft : inner;
  return axis === "x" ? { tl: s, bl: s, tr: e, br: e } : { tl: s, tr: s, bl: e, br: e };
}

/** 不在任何 run 里的部件：四角都是它自己的外圆角 */
export function baseRadiiOf(it: ConnectItem): Radii {
  const c = connectSpecOf(it);
  return c ? runCorners(c.axis, true, true, c.outer, c.inner) : { tl: 0, tr: 0, bl: 0, br: 0 };
}

/* ============================================================
 * 5. 自由组里的隐藏 run
 * ============================================================ */

/** 吸附条件里的"贴齐"：沿轴正好隔一个 GAP，且跨轴对齐 */
export const near = (a: number, b: number) => Math.abs(a - b) <= 3;

/**
 * 把自由摆放的部件写成它包含的 run：同族同轴、正好相隔一个 GAP 的相邻部件仍算连通，
 * 其余各自成 run。布局、圆角、解组看到的都是同一组 run。
 */
export function explodeRuns(runs: ConnectRun[]): ConnectRun[] {
  const out: ConnectRun[] = [];
  for (const g of runs) {
    if (!g.free) {
      out.push(g);
      continue;
    }
    const placed = [...layoutOfRun(g)].sort((a, b) => a.y - b.y || a.x - b.x);
    const used = new Set<string>();
    for (const start of placed) {
      if (used.has(start.item.id)) continue;
      used.add(start.item.id);
      const run = [start];
      const axis = connectSpecOf(start.item)?.axis ?? "x";
      let last = start;
      for (;;) {
        const next = placed.find(
          (q) =>
            !used.has(q.item.id) &&
            canJoin(last.item, q.item) &&
            (axis === "x"
              ? near(q.y, last.y) && near(q.x, last.x + last.w + GAP)
              : near(q.x, last.x) && near(q.y, last.y + last.h + GAP)),
        );
        if (!next) break;
        used.add(next.item.id);
        run.push(next);
        last = next;
      }
      out.push({ id: `${g.id}:${run[0].item.id}`, axis, x: run[0].x, y: run[0].y, items: run.map((r) => r.item), locked: g.locked });
    }
  }
  return out;
}

/** 每个部件在所处 run 里的圆角（自由组里的隐藏 run 也会保持连通） */
export function radiiOfRuns(runs: ConnectRun[]): Map<string, Radii> {
  const out = new Map<string, Radii>();
  for (const run of explodeRuns(runs)) {
    const n = run.items.length;
    run.items.forEach((it, i) => {
      const c = connectSpecOf(it);
      out.set(it.id, c ? runCorners(run.axis, i === 0, i === n - 1, c.outer, c.inner) : { tl: 0, tr: 0, bl: 0, br: 0 });
    });
  }
  return out;
}

/* ============================================================
 * 6. 画一个部件
 * ============================================================ */

const cssRadii = (r: Radii): CSSProperties => ({
  borderTopLeftRadius: r.tl,
  borderTopRightRadius: r.tr,
  borderBottomRightRadius: r.br,
  borderBottomLeftRadius: r.bl,
});

export type ConnectItemViewProps = {
  item: ConnectItem;
  /** 所在 run 给它的圆角；不传就用它自己的 */
  radii?: Radii;
  /** 拖拽中：只负责画，不接指针 */
  ghost?: boolean;
  style?: CSSProperties;
};

/** 画一个可连接的部件：按钮 / 图标按钮 / chip / 列表项 */
export function ConnectItemView({ item, radii, ghost, style }: ConnectItemViewProps) {
  const sz = sizeOf(item);
  const box: CSSProperties = {
    ...cssRadii(radii ?? baseRadiiOf(item)),
    ...(ghost ? { pointerEvents: "none" } : null),
    ...style,
  };

  switch (item.kind) {
    case "button":
      return (
        <Button
          label={item.label}
          icon={item.icon}
          variant={item.variant ?? "filled"}
          size={sz.h}
          width={sz.w}
          style={box}
        />
      );
    case "iconButton":
      return <Button icon={item.icon ?? "star"} variant={item.variant ?? "filled"} size={sz.h} width={sz.h} style={box} />;
    case "chip":
      return <Chip label={item.label ?? "Chip"} icon={item.icon} variant={item.variant ?? "outlined"} size={sz.h} style={{ ...box, width: sz.w }} />;
    case "listItem":
      return (
        <ListItem
          label={item.label ?? "列表项"}
          supportingText={item.supportingText}
          icon={item.icon}
          fill={item.fill}
          width={sz.w}
          height={sz.h}
          style={box}
        />
      );
  }
}

/* ============================================================
 * 7. run 的躯干：cells + 空位
 * ============================================================ */

/** 让出来的空位：从 0 展开，关闭时收回，宽度随 run 自己的间距一起走 */
type Hole = { gid: string; index: number; w: number; h: number; open: boolean; from: boolean };

const EASE = "cubic-bezier(0.2, 0, 0, 1)";

function GapCell({ axis, w, h, open, from }: { axis: Axis; w: number; h: number; open: boolean; from: boolean }) {
  const [grown, setGrown] = useState(from);
  useEffect(() => {
    if (from) {
      setGrown(true);
      return;
    }
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, [from]);
  const main = grown && open ? (axis === "x" ? w : h) : 0;
  /**
   * 空位的宽度就是部件的宽度：run 自己的间距挂在它旁边，所以关上的空位把这份间距从
   * 自己的外边距里扣掉 —— 它对 run 的占用于是和 run 的偏移一起走到 0。
   */
  return (
    <div
      aria-hidden
      style={{
        flex: "0 0 auto",
        width: axis === "x" ? main : w,
        height: axis === "x" ? h : main,
        marginRight: axis === "x" ? (open ? 0 : -GAP) : undefined,
        marginBottom: axis === "y" ? (open ? 0 : -GAP) : undefined,
        transition: `width ${SETTLE_MS}ms ${EASE}, height ${SETTLE_MS}ms ${EASE}, margin ${SETTLE_MS}ms ${EASE}`,
      }}
    />
  );
}

export type ConnectRunBodyProps = {
  run: ConnectRun;
  /** 这条 run 的磁吸拉力（只有被吸附的 run 有） */
  pull?: number;
  /** 正在让位的空位 */
  hole?: Hole | null;
  /** 拖拽中的部件不画在这里 */
  hideId?: string;
  /** 按下某个部件开始拖 */
  onGrab?: (e: ReactPointerEvent<HTMLElement>, item: ConnectItem, run: ConnectRun, index: number) => void;
};

/** 一条 run 的部件序列：外圆内小，挨着空位的一侧随拉力变软 */
export function ConnectRunBody({ run, pull = 0, hole = null, hideId, onGrab }: ConnectRunBodyProps) {
  const spec = run.items[0] ? connectSpecOf(run.items[0]) : undefined;
  const phMain = hole && hole.open ? (run.axis === "x" ? hole.w : hole.h) : 0;
  /* 空位在队首时它的宽度从 run 自己的位置上扣，后面的部件才不会跟  着动 */
  const front = hole && hole.index === 0 ? -(phMain + (hole.open ? GAP : 0)) : 0;

  type Cell = { ph: true } | { ph: false; item: ConnectItem; index: number };
  const cells: Cell[] = [];
  for (let i = 0; i <= run.items.length; i++) {
    if (hole && hole.index === i) cells.push({ ph: true });
    if (i < run.items.length) cells.push({ ph: false, item: run.items[i], index: i });
  }
  const m = cells.length;

  return (
    <div
      data-md3e-run={run.id}
      data-front={front ? front.toFixed(0) : undefined}
      style={{
        display: "flex",
        flexDirection: run.axis === "x" ? "row" : "column",
        alignItems: run.axis === "x" ? "center" : "flex-start",
        gap: GAP,
        isolation: "isolate",
      }}
    >
      {cells.map((c, r) => {
        if (c.ph) {
          return <GapCell key="__gap" axis={run.axis} w={hole?.w ?? 0} h={hole?.h ?? 0} open={!!hole?.open} from={!!hole?.from} />;
        }
        if (hideId === c.item.id) return null;
        const ic = connectSpecOf(c.item);
        const prevPh = r > 0 && cells[r - 1].ph;
        const nextPh = r < m - 1 && cells[r + 1].ph;
        const radii =
          spec && ic
            ? runRadii(run.axis, r === 0, r === m - 1, prevPh, nextPh, pull, ic.outer, ic.inner)
            : ic
              ? baseRadiiOf(c.item)
              : undefined;
        return (
          <div
            key={c.item.id}
            onPointerDown={onGrab ? (e) => onGrab(e, c.item, run, c.index) : undefined}
            style={{ flex: "0 0 auto", cursor: onGrab ? "grab" : undefined, touchAction: "none" }}
          >
            <ConnectItemView item={c.item} radii={radii} />
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * 8. 静态：一条摆好的 run
 * ============================================================ */

export type ConnectRunViewProps = {
  axis: Axis;
  items: ConnectItem[];
  /** 整体拉力 0..1：预览"部件正在靠近"时的软圆角 */
  pull?: number;
  gap?: number;
  style?: CSSProperties;
};

/** 摆好的一条 run：用来静态展示融合圆角（外圆内小）与拉力的连续变化 */
export function ConnectRunView({ axis, items, pull = 0, gap, style }: ConnectRunViewProps) {
  const run: ConnectRun = useMemo(() => ({ id: "preview", axis, x: 0, y: 0, items }), [axis, items]);
  return (
    <div style={{ display: "flex", flexDirection: axis === "x" ? "row" : "column", gap: gap ?? GAP, ...style }}>
      <ConnectRunBody run={run} pull={pull} />
    </div>
  );
}

/* ============================================================
 * 9. 舞台：拖动 → 吸附 → 落地
 * ============================================================ */

type DragState = {
  base: ConnectItem;
  item: ConnectItem;
  active: boolean;
  fromRunId: string | null;
  fromIndex: number;
  start: { x: number; y: number };
  local: { x: number; y: number };
  off: { x: number; y: number };
  snap: Snap | null;
  guide: Guide | null;
  settling: boolean;
  ctrl: boolean;
};

export type ConnectStageProps = {
  width?: number;
  height?: number;
  runs?: ConnectRun[];
  /** 关掉磁吸场的可视化 */
  showField?: boolean;
  /** 右侧挂上条件面板，实时读出"为什么吸得上 / 吸不上" */
  withRules?: boolean;
};

const DEMO_RUNS: ConnectRun[] = [
  {
    id: "r-btn",
    axis: "x",
    x: 72,
    y: 64,
    items: [
      { id: "b1", kind: "button", label: "分享", icon: "share", main: 108 },
      { id: "b2", kind: "button", label: "下载", icon: "download", main: 108 },
      { id: "b3", kind: "button", label: "更多", icon: "more_horiz", main: 108 },
    ],
  },
  {
    id: "r-list",
    axis: "y",
    x: 460,
    y: 48,
    items: [
      { id: "l1", kind: "listItem", label: "列表项一", supportingText: "三个一串就融合成一条", icon: "wifi", cross: 300, main: 72 },
      { id: "l2", kind: "listItem", label: "列表项二", supportingText: "外圆内小，间距 3dp", icon: "bluetooth", cross: 300, main: 72 },
      { id: "l3", kind: "listItem", label: "列表项三", supportingText: "拖出去就自己散开", icon: "volume_up", cross: 300, main: 72 },
    ],
  },
  {
    id: "r-chip",
    axis: "x",
    x: 72,
    y: 176,
    items: [
      { id: "c1", kind: "chip", label: "薯条", icon: "local_pizza", main: 104 },
      { id: "c2", kind: "chip", label: "汉堡", main: 96 },
      { id: "c3", kind: "chip", label: "饮料", main: 96 },
    ],
  },
  { id: "r-solo", axis: "x", x: 72, y: 264, items: [{ id: "s1", kind: "button", label: "拖我", icon: "pan_tool", variant: "tonal", main: 124 }] },
];

/** 可拖拽的舞台：从 run 里拖出、靠磁铁吸进另一条 run，或落在空白处自成一条。 */
export function ConnectStage({ width = 800, height = 420, runs: runsProp, showField = true, withRules }: ConnectStageProps) {
  const { palette } = useMd3e();
  const [runs, setRuns] = useState<ConnectRun[]>(() => runsProp ?? DEMO_RUNS);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hole, setHole] = useState<Hole | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const runsRef = useRef(runs);
  runsRef.current = runs;
  const holeTimer = useRef<number | null>(null);
  const pendingRef = useRef<{ timer: number } | null>(null);

  const openHole = useCallback((next: { gid: string; index: number; w: number; h: number }, from: boolean) => {
    if (holeTimer.current) {
      window.clearTimeout(holeTimer.current);
      holeTimer.current = null;
    }
    setHole((cur) => {
      /* 从这条 run 里出来的部件，只要还在够得着的范围里，它留的洞就一直是全尺寸的：
         一个从别处飞来的部件则是一边靠近一边把位置撑开。 */
      const keep = !!cur && cur.gid === next.gid && cur.index === next.index && cur.from;
      return { ...next, open: true, from: from || keep };
    });
  }, []);

  const closeHole = useCallback(() => {
    setHole((cur) => (cur && cur.open ? { ...cur, open: false } : cur));
    if (holeTimer.current) window.clearTimeout(holeTimer.current);
    holeTimer.current = window.setTimeout(() => setHole(null), SETTLE_MS + 40);
  }, []);

  useEffect(() => () => {
    if (holeTimer.current) window.clearTimeout(holeTimer.current);
    if (pendingRef.current) window.clearTimeout(pendingRef.current.timer);
  }, []);

  const grab = useCallback((e: ReactPointerEvent<HTMLElement>, item: ConnectItem, run: ConnectRun, index: number) => {
    if (!run.items.some((it) => it.id === item.id)) return;
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return;
    const local = { x: e.clientX - box.left, y: e.clientY - box.top };
    const placed = layoutOfRun(run).find((p) => p.item.id === item.id) ?? { x: local.x, y: local.y };
    const d: DragState = {
      base: item,
      item,
      active: false,
      fromRunId: run.id,
      fromIndex: index,
      start: local,
      local,
      off: { x: local.x - placed.x, y: local.y - placed.y },
      snap: null,
      guide: null,
      settling: false,
      ctrl: e.ctrlKey || e.metaKey,
    };
    dragRef.current = d;
    setDrag({ ...d });
  }, []);

  const dragging = drag !== null;

  useEffect(() => {
    if (!dragging) return;

    const move = (e: PointerEvent) => {
      const d = dragRef.current;
      const box = stageRef.current?.getBoundingClientRect();
      if (!d || !box) return;
      const local = { x: e.clientX - box.left, y: e.clientY - box.top };
      d.local = local;
      d.ctrl = e.ctrlKey || e.metaKey;

      if (!d.active) {
        if (Math.hypot(local.x - d.start.x, local.y - d.start.y) < 5) {
          setDrag({ ...d });
          return;
        }
        /* 起手：从 run 里把它取出来，run 保留它原来的位置（洞），而不是一按下就合上 */
        d.active = true;
        if (d.fromRunId) {
          const g = runsRef.current.find((x) => x.id === d.fromRunId);
          const idx = g ? g.items.findIndex((it) => it.id === d.base.id) : -1;
          if (g && idx >= 0) {
            const sz = sizeOf(g.items[idx]);
            const rest = g.items.filter((it) => it.id !== d.base.id);
            const back = idx === 0;
            if (rest.length === 0) {
              setRuns((prev) => prev.filter((x) => x.id !== g.id));
            } else {
              setRuns((prev) =>
                prev.map((x) =>
                  x.id === g.id
                    ? {
                        ...x,
                        x: back && x.axis === "x" ? x.x + sz.w + GAP : x.x,
                        y: back && x.axis === "y" ? x.y + sz.h + GAP : x.y,
                        items: rest,
                      }
                    : x,
                ),
              );
              openHole({ gid: g.id, index: idx, w: sz.w, h: sz.h }, true);
            }
          }
        }
        setDrag({ ...d });
        return;
      }

      const now = runsRef.current;
      d.snap = d.ctrl ? null : findSnap(d.base, local.x - d.off.x, local.y - d.off.y, now);
      const host = d.snap ? now.find((g) => g.id === d.snap!.groupId)?.items[0] : undefined;
      d.item = host ? matchRunSize(d.base, host) : d.base;
      /* 尺寸变了，指针下的那一点还得是原来那一点 */
      const was = sizeOf(d.base);
      const to = sizeOf(d.item);
      d.off = { x: was.w ? (d.off.x * to.w) / was.w : d.off.x, y: was.h ? (d.off.y * to.h) / was.h : d.off.y };

      if (d.snap) openHole({ gid: d.snap.groupId, index: d.snap.index, w: to.w, h: to.h }, false);
      else closeHole();

      d.guide = d.snap || d.ctrl ? null : findGuide(d.base, local.x - d.off.x, local.y - d.off.y, now);
      setDrag({ ...d });
    };

    const up = (e: PointerEvent) => {
      const d = dragRef.current;
      dragRef.current = null;
      if (!d) return;
      if (!d.active) {
        setDrag(null);
        return;
      }
      const loose = d.ctrl || e.ctrlKey || e.metaKey;
      const item = d.item;
      const sz = sizeOf(item);

      /* 吸住了：拉力先补满，让它自己滑进槽位，SETTLE_MS 之后才算落定 */
      if (!loose && d.snap) {
        const t = d.snap;
        setDrag({ ...d, snap: { ...t, pull: 1 }, settling: true });
        const commit = () => {
          setRuns((prev) =>
            prev.map((g) => {
              if (g.id !== t.groupId) return g;
              const front = t.index === 0;
              return {
                ...g,
                x: front && g.axis === "x" ? g.x - sz.w - GAP : g.x,
                y: front && g.axis === "y" ? g.y - sz.h - GAP : g.y,
                items: [...g.items.slice(0, t.index), item, ...g.items.slice(t.index)],
              };
            }),
          );
          setHole(null);
          setDrag(null);
          pendingRef.current = null;
        };
        pendingRef.current = { timer: window.setTimeout(commit, SETTLE_MS) };
        return;
      }

      /* 没吸上：落在指针处，自己对一条新 run —— Ctrl 落点原样，否则让参考线说了算 */
      const left = loose ? d.local.x - d.off.x : d.guide?.x ?? d.local.x - d.off.x;
      const top = loose ? d.local.y - d.off.y : d.guide?.y ?? d.local.y - d.off.y;
      setRuns((prev) => [
        ...prev,
        {
          id: `run:${item.id}`,
          axis: connectSpecOf(item)?.axis ?? "x",
          x: Math.round(left),
          y: Math.round(top),
          items: [item],
        },
      ]);
      setHole(null);
      setDrag(null);
    };

    /* 指针停着的时候按下 / 松开 Ctrl，磁铁与参考线要立刻走（或立刻回来） */
    const onKey = (e: KeyboardEvent, held: boolean) => {
      if ((e.key !== "Control" && e.key !== "Meta") || e.repeat) return;
      const d = dragRef.current;
      if (!d) return;
      d.ctrl = held;
      if (held) {
        d.snap = null;
        d.guide = null;
      }
      setDrag({ ...d });
    };
    const down = (e: KeyboardEvent) => onKey(e, true);
    const upKey = (e: KeyboardEvent) => onKey(e, false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", upKey);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", upKey);
    };
  }, [dragging, closeHole, openHole]);

  /* 拖拽中的部件：被磁铁拉向槽位，拉力越大越贴 */
  const follower = (() => {
    if (!drag || !drag.active) return null;
    const l = drag.local.x - drag.off.x;
    const t = drag.local.y - drag.off.y;
    if (drag.snap) {
      const g = runs.find((x) => x.id === drag.snap!.groupId);
      if (g) {
        const r = restPosOf(g, drag.snap.index, sizeOf(drag.item));
        return { left: lerp(l, r.left, drag.snap.pull), top: lerp(t, r.top, drag.snap.pull) };
      }
    }
    if (drag.guide) return { left: drag.guide.x ?? l, top: drag.guide.y ?? t };
    return { left: l, top: t };
  })();

  const snapRun = drag?.snap ? runs.find((g) => g.id === drag.snap!.groupId) : undefined;
  const field = snapRun && drag?.active ? fieldOf(snapRun, drag.snap!.index, drag.item) : null;

  const followerRadii = (() => {
    if (!drag) return undefined;
    const ic = connectSpecOf(drag.item);
    if (!ic || !drag.snap || !snapRun) return baseRadiiOf(drag.item);
    const m = snapRun.items.length + 1;
    const k = drag.snap.index;
    return runRadii(ic.axis, k === 0, k === m - 1, k > 0, k < m - 1, drag.snap.pull, ic.outer, ic.inner);
  })();

  const stage = (
    <div
      ref={stageRef}
      style={{
        position: "relative",
        width,
        height,
        background: palette.surfaceContainerLow,
        border: `1px solid ${palette.outlineVariant}`,
        borderRadius: 24,
        overflow: "hidden",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {runs.map((run) => {
        const mine = drag?.active && drag.snap?.groupId === run.id ? drag.snap : null;
        const myHole = hole && hole.gid === run.id ? hole : null;
        const phMain = myHole && myHole.open ? (run.axis === "x" ? myHole.w : myHole.h) : 0;
        const front = myHole && myHole.index === 0 ? -(phMain + (myHole.open ? GAP : 0)) : 0;
        return (
          <div
            key={run.id}
            style={{
              position: "absolute",
              left: run.x + (run.axis === "x" ? front : 0),
              top: run.y + (run.axis === "y" ? front : 0),
              transition: myHole ? `left ${SETTLE_MS}ms ${EASE}, top ${SETTLE_MS}ms ${EASE}` : undefined,
            }}
          >
            <ConnectRunBody
              run={run}
              pull={mine?.pull ?? 0}
              hole={myHole}
              hideId={drag?.active ? drag.base.id : undefined}
              onGrab={grab}
            />
          </div>
        );
      })}

      {/* 磁吸场：沿轴 ±44dp、跨轴 ±24dp，只有最佳的那个候选才画出来 */}
      {showField && field && (
        <>
          <div
            style={{
              position: "absolute",
              left: field.field.x,
              top: field.field.y,
              width: field.field.w,
              height: field.field.h,
              border: `1px dashed ${palette.primary}`,
              borderRadius: 12,
              opacity: 0.15 + 0.45 * (drag?.snap?.pull ?? 0),
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: field.rest.left,
              top: field.rest.top,
              width: field.rest.w,
              height: field.rest.h,
              border: `2px solid ${palette.primary}`,
              borderRadius: 10,
              opacity: 0.35 + 0.65 * (drag?.snap?.pull ?? 0),
              pointerEvents: "none",
            }}
          />
        </>
      )}

      {/* 对齐参考线 */}
      {drag?.active && drag.guide?.gx !== undefined && (
        <div
          style={{
            position: "absolute",
            left: drag.guide.gx,
            top: 0,
            bottom: 0,
            width: 1,
            background: palette.primary,
            opacity: 0.7,
            pointerEvents: "none",
          }}
        />
      )}
      {drag?.active && drag.guide?.gy !== undefined && (
        <div
          style={{
            position: "absolute",
            top: drag.guide.gy,
            left: 0,
            right: 0,
            height: 1,
            background: palette.primary,
            opacity: 0.7,
            pointerEvents: "none",
          }}
        />
      )}

      {/* 手上飞着的那一个 */}
      {drag?.active && follower && (
        <div
          style={{
            position: "absolute",
            left: follower.left,
            top: follower.top,
            zIndex: 50,
            pointerEvents: "none",
            opacity: drag.ctrl ? 0.85 : 1,
            transition: drag.settling ? `left ${SETTLE_MS}ms ${EASE}, top ${SETTLE_MS}ms ${EASE}` : undefined,
            filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.22))",
          }}
        >
          <ConnectItemView item={drag.item} radii={followerRadii} ghost />
        </div>
      )}

      <div style={{ position: "absolute", left: 20, bottom: 16, fontSize: 12, color: palette.onSurfaceVariant, pointerEvents: "none" }}>
        拖动任意部件：进磁吸场就融合，按住 Ctrl / Cmd 则不吸附
      </div>
    </div>
  );

  if (!withRules) return stage;
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {stage}
      <ConnectRules item={drag?.active ? drag.base : null} runs={runs} snap={drag?.active ? drag.snap : null} ctrl={drag?.ctrl} />
    </div>
  );
}

/* ============================================================
 * 10. 条件面板：为什么吸得上 / 吸不上
 * ============================================================ */

export type ConnectRulesProps = {
  item: ConnectItem | null;
  runs: ConnectRun[];
  snap: Snap | null;
  ctrl?: boolean;
};

type Judgement = { ok: boolean; why: string };

/** 逐条读出吸附条件：轴、族、磁吸场，缺一条就吸不上 */
export function judgeRun(run: ConnectRun, item: ConnectItem, snap: Snap | null): Judgement {
  const spec = connectSpecOf(item);
  if (!spec) return { ok: false, why: "这类部件不可连接" };
  if (run.free) return { ok: false, why: "自由摆放的组不参与吸附" };
  if (run.locked) return { ok: false, why: "已锁定，不接受新部件" };
  if (run.axis !== spec.axis) return { ok: false, why: `轴不同（run ${run.axis} / 部件 ${spec.axis}）` };
  const hc = run.items[0] ? connectSpecOf(run.items[0]) : undefined;
  if (!hc || hc.family !== spec.family) return { ok: false, why: `族不同（run ${hc?.family ?? "—"} / 部件 ${spec.family}）` };
  if (snap && snap.groupId === run.id) return { ok: true, why: `命中槽位 #${snap.index + 1}，拉力 ${(snap.pull * 100).toFixed(0)}%` };
  return { ok: false, why: "轴与族都对，但不在磁吸场内" };
}

/** 拖动时把每条 run 的判定列出来；没在拖就显示规格表 */
export function ConnectRules({ item, runs, snap, ctrl }: ConnectRulesProps) {
  const { palette } = useMd3e();
  const spec = item ? connectSpecOf(item) : undefined;

  return (
    <div
      style={{
        width: 320,
        padding: 16,
        borderRadius: 16,
        background: palette.surfaceContainer,
        color: palette.onSurface,
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>吸附条件</div>

      {!item || !spec ? (
        <>
          <div style={{ color: palette.onSurfaceVariant, marginBottom: 10 }}>按下并拖动舞台上的部件，这里会实时判定。</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <tbody>
              {(Object.keys(CONNECT_SPECS) as ConnectKind[]).map((k) => {
                const c = CONNECT_SPECS[k];
                return (
                  <tr key={k}>
                    <td style={{ padding: "3px 0" }}>{k}</td>
                    <td style={{ padding: "3px 0", color: palette.onSurfaceVariant }}>{c.axis}</td>
                    <td style={{ padding: "3px 0", color: palette.onSurfaceVariant }}>{c.family}</td>
                    <td style={{ padding: "3px 0", color: palette.onSurfaceVariant }}>
                      {c.outer} / {c.inner}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 10, color: palette.onSurfaceVariant, fontSize: 12 }}>
            磁吸场：沿轴 {SNAP_MAIN}dp，跨轴 {SNAP_CROSS}dp；间距 {GAP}dp，拉力指数 {PULL_EXP}。
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            <Tag text={item.kind} palette={palette} />
            <Tag text={`轴 ${spec.axis}`} palette={palette} />
            <Tag text={`族 ${spec.family}`} palette={palette} />
            <Tag text={`外 ${spec.outer} / 内 ${spec.inner}`} palette={palette} />
            {ctrl && <Tag text="Ctrl：已关闭吸附" palette={palette} warn />}
          </div>

          {runs.map((run) => {
            const j = judgeRun(run, item, snap);
            return (
              <div
                key={run.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 8px",
                  borderRadius: 8,
                  background: j.ok ? (palette.primaryContainer as string) : "transparent",
                  color: j.ok ? palette.onPrimaryContainer : palette.onSurfaceVariant,
                }}
              >
                <span style={{ width: 14 }}>{j.ok ? "●" : "○"}</span>
                <span style={{ width: 74, opacity: 0.9 }}>{run.id}</span>
                <span style={{ flex: 1 }}>{j.why}</span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function Tag({ text, palette, warn }: { text: string; palette: Palette; warn?: boolean }) {
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 8,
        fontSize: 12,
        background: warn ? palette.errorContainer : palette.surfaceContainerHighest,
        color: warn ? palette.onErrorContainer : palette.onSurfaceVariant,
      }}
    >
      {text}
    </span>
  );
}

/* ============================================================
 * 11. 间距探测：只有正好隔一个 GAP 才算连通
 * ============================================================ */

/** 两个列表项的间距从 0 拉到 16dp：只有落到 3dp 上下（±3）时，它们才被读成一条 run。 */
export function ConnectSpacingProbe() {
  const { palette } = useMd3e();
  const [gapPx, setGapPx] = useState(3);
  const items: ConnectItem[] = useMemo(
    () => [
      { id: "p1", kind: "listItem", label: "上面一项", supportingText: "同族 · 同轴", icon: "wifi", cross: 300, main: 72 },
      { id: "p2", kind: "listItem", label: "下面一项", supportingText: "间距决定是否融合", icon: "bluetooth", cross: 300, main: 72 },
    ],
    [],
  );
  const runs: ConnectRun[] = useMemo(
    () => [
      {
        id: "free",
        axis: "y",
        x: 0,
        y: 0,
        free: true,
        items,
        pos: { p1: { x: 0, y: 0 }, p2: { x: 0, y: 72 + gapPx } },
      },
    ],
    [items, gapPx],
  );
  const filled = explodeRuns(runs);
  const fused = filled.length === 1 && filled[0].items.length === 2;
  const radii = radiiOfRuns(runs);

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      <div style={{ position: "relative", width: 300, height: 72 * 2 + gapPx + 2 }}>
        {layoutOfRun(runs[0]).map((pl) => (
          <div key={pl.item.id} style={{ position: "absolute", left: pl.x, top: pl.y }}>
            <ConnectItemView item={pl.item} radii={radii.get(pl.item.id)} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: palette.onSurface }}>
        <span>
          间距 <b>{gapPx}dp</b>
        </span>
        <input
          type="range"
          min={0}
          max={16}
          value={gapPx}
          onChange={(e) => setGapPx(Number(e.target.value))}
          style={{ width: 200 }}
        />
        <span style={{ color: fused ? palette.primary : palette.onSurfaceVariant }}>
          {fused ? `读成一条 run（${filled[0].items.length} 项）：外圆内小` : `读成 ${filled.length} 条 run：各自全圆角`}
        </span>
        <span style={{ fontSize: 12, color: palette.onSurfaceVariant, maxWidth: 220 }}>
          判定条件：同族、同轴、沿轴正好隔一个 GAP(±3dp)、跨轴对齐。缺一条就散开。
        </span>
      </div>
    </div>
  );
}
