import type { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  root: {
    position: "fixed",
    left: 16,
    bottom: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    pointerEvents: "none",
    zIndex: 9999,
  },
  line1: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(0, 0, 0, 0.38)",
    lineHeight: 1.4,
  },
  line2: {
    fontSize: 10,
    fontWeight: 600,
    color: "rgba(0, 0, 0, 0.28)",
    lineHeight: 1.4,
  },
};

export default function Watermark() {
  return (
    <div style={styles.root}>
      <span style={styles.line1}>2.1.100.1 TanaSule</span>
      <span style={styles.line2}>开发中画面，不代表最终效果</span>
    </div>
  );
}
