"use client";

/**
 * 吸附 / 连通组的独立演示入口：
 *   vite dev 下打开 http://localhost:5199/connect.html
 */

import { createRoot } from "react-dom/client";
import { ConnectRunView, ConnectSpacingProbe, ConnectStage, Md3eProvider, type ConnectItem } from "./component";

const BTN_RUN: ConnectItem[] = [
  { id: "x1", kind: "button", label: "分享", icon: "share", main: 108 },
  { id: "x2", kind: "button", label: "下载", icon: "download", main: 108 },
  { id: "x3", kind: "button", label: "更多", icon: "more_horiz", main: 108 },
];
const LIST_RUN: ConnectItem[] = [
  { id: "y1", kind: "listItem", label: "无线网络", supportingText: "已连接 · 5GHz", icon: "wifi", cross: 320, main: 72 },
  { id: "y2", kind: "listItem", label: "蓝牙", supportingText: "2 台设备", icon: "bluetooth", cross: 320, main: 72 },
  { id: "y3", kind: "listItem", label: "声音", supportingText: "媒体音量 60%", icon: "volume_up", cross: 320, main: 72 },
];

function Page() {
  return (
    <div style={{ padding: 28, maxWidth: 1180, margin: "0 auto" }}>
      <div style={{ fontSize: 28, fontWeight: 500 }}>连通组与吸附条件</div>
      <div style={{ fontSize: 14, opacity: 0.7, margin: "4px 0 22px" }}>
        外圆内小 · 间距 3dp · 磁吸场沿轴 44dp / 跨轴 24dp · 拉力 pull = (1 - 距离)^2.2
      </div>

      <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 8 }}>横向 run：按钮</div>
          <ConnectRunView axis="x" items={BTN_RUN} />
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 8 }}>纵向 run：列表项</div>
          <ConnectRunView axis="y" items={LIST_RUN} />
        </div>
      </div>

      <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 8 }}>拖动 → 磁吸 → 落地</div>
      <ConnectStage width={720} height={420} withRules />

      <div style={{ fontSize: 12, opacity: 0.65, margin: "28px 0 8px" }}>间距决定连通</div>
      <ConnectSpacingProbe />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <Md3eProvider palette="purple" shape="rounded" fontFamily='"MiSans", Roboto, system-ui, -apple-system, sans-serif'>
    <Page />
  </Md3eProvider>,
);
