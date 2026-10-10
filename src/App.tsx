import { useEffect, useRef, useState } from "react";
import "./App.css";
import { BottomSheet, Box, ConnectRunView, Slider, type ConnectItem } from "./component";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

const SUBJECTS = ["语文", "数学", "英语", "物理", "道法", "政治", "习思想", "地理", "生物"];

const MENU_ITEMS: ConnectItem[] = [
  { id: "m1", kind: "listItem", label: "设置", supportingText: "打开作业板设置", icon: "settings", fill: "surface", cross: 348, main: 72 },
  { id: "m2", kind: "listItem", label: "云端同步", supportingText: "进行云端同步", icon: "cloud_sync", fill: "surface", cross: 348, main: 72 },
  { id: "m3", kind: "listItem", label: "保存", supportingText: "对作业进行本地保存", icon: "save", fill: "surface", cross: 348, main: 72 },
  { id: "m4", kind: "listItem", label: "电源选项", supportingText: "重启退出作业看板", icon: "power_settings_new", fill: "surface", cross: 348, main: 72 },
];

function App() {
  const now = new Date();
  const [moreSelected, setMoreSelected] = useState(false);
  const [closing, setClosing] = useState(false);
  const [scale, setScale] = useState(100);
  const [stacked, setStacked] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subject, setSubject] = useState("语文");
  const [content, setContent] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setStacked(window.innerWidth <= 750);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function closeMenu() {
    setClosing(true);
  }

  function onSheetExit(e: React.AnimationEvent<HTMLDivElement>) {
    if (e.animationName === "more-sheet-slide-down") {
      setMoreSelected(false);
      setClosing(false);
    }
  }

  function openEditor() {
    setSubject("语文");
    setContent("");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    setDialogOpen(true);
  }

  function execCommand(cmd: string) {
    editorRef.current?.focus();
    document.execCommand(cmd);
    setContent(editorRef.current?.innerText ?? "");
  }

  function handleAssign() {
    setDialogOpen(false);
  }

  return (
    <main className="container">
      <div className="titlebar" data-tauri-drag-region></div>
      <p className="date-text">
        {now.getMonth() + 1} 月 {now.getDate()} 日 星期{WEEKDAYS[now.getDay()]}
      </p>
      <h1 className="title-text">作业</h1>

      <div className="empty-state">
        <md-icon className="empty-icon">assignment</md-icon>
        <p className="empty-text">
          还没有作业哦，快点击右下角"+"布置吧！
        </p>
      </div>

      <md-dialog
        open={dialogOpen}
        onClosed={() => setDialogOpen(false)}
      >
        <div slot="headline">布置作业</div>

        <div slot="content" className="hw-editor">
          <div className="subject-list">
            {SUBJECTS.map((s) => (
              <label className="subject-item" key={s}>
                <md-radio
                  value={s}
                  checked={subject === s}
                  onInput={() => setSubject(s)}
                />
                <span className="subject-name">{s}</span>
              </label>
            ))}
          </div>

          <md-divider vertical></md-divider>

          <div className="editor">
            <div className="toolbar">
              <md-icon-button
                aria-label="粗体"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand("bold")}
              >
                <md-icon>format_bold</md-icon>
              </md-icon-button>
              <md-icon-button
                aria-label="斜体"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand("italic")}
              >
                <md-icon>format_italic</md-icon>
              </md-icon-button>
              <md-icon-button
                aria-label="删除线"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand("strikeThrough")}
              >
                <md-icon>format_strikethrough</md-icon>
              </md-icon-button>
              <md-icon-button
                aria-label="下划线"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCommand("underline")}
              >
                <md-icon>format_underline</md-icon>
              </md-icon-button>
            </div>
            <div
              className="rich-editor"
              ref={editorRef}
              contentEditable
              data-placeholder="在此输入作业内容..."
              onInput={() => setContent(editorRef.current?.innerText ?? "")}
            ></div>
          </div>
        </div>

        <div slot="actions">
          <md-text-button onClick={() => setDialogOpen(false)}>取消</md-text-button>
          <md-filled-button disabled={!subject || !content.trim()} onClick={handleAssign}>
            布置
          </md-filled-button>
        </div>
      </md-dialog>

      {moreSelected && (
        <div
          className={`more-sheet-overlay${closing ? " closing" : ""}`}
          onClick={closeMenu}
        >
          <div
            className={`more-sheet${closing ? " closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
            onAnimationEnd={onSheetExit}
          >
            <BottomSheet
              width={stacked ? 380 : 720}
              height={stacked ? 660 : 404}
              style={{ transition: "width 220ms cubic-bezier(0.2,0,0,1), height 220ms cubic-bezier(0.2,0,0,1)" }}
            >
              <div className="more-sheet-content">
                <div className="more-sheet-title">菜单</div>
                <div className={`more-sheet-body${stacked ? " stacked" : ""}`}>
                  <ConnectRunView axis="y" items={MENU_ITEMS} />
                  <Box
                    fill="surfaceContainer"
                    width={stacked ? 348 : 300}
                    height={stacked ? 160 : 297}
                    radius={28}
                    style={{ padding: 24, boxSizing: "border-box", transition: "width 220ms cubic-bezier(0.2,0,0,1), height 220ms cubic-bezier(0.2,0,0,1)" }}
                  >
                    <div className="more-slider-panel">
                      <div className="more-slider-label">作业缩放</div>
                      <div className="more-slider-row">
                        <Slider value={scale} onChange={setScale} width={stacked ? 244 : 196} style={{ transition: "width 220ms cubic-bezier(0.2,0,0,1)" }} />
                        <span className="more-slider-value">{scale}%</span>
                      </div>
                    </div>
                  </Box>
                </div>
              </div>
            </BottomSheet>
          </div>
        </div>
      )}

      <div className="corner-actions">
        <md-fab aria-label="新建" onClick={openEditor}>
          <md-icon slot="icon">add</md-icon>
        </md-fab>
        <md-icon-button
          toggle
          selected={moreSelected}
          onInput={() => (moreSelected ? closeMenu() : setMoreSelected(true))}
          aria-label="更多"
        >
          <md-icon>more_vert</md-icon>
          <md-icon slot="selected">more_vert</md-icon>
        </md-icon-button>
      </div>
    </main>
  );
}

export default App;