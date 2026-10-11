import { useEffect, useRef, useState, type ComponentType } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import {
  BottomSheet,
  Box,
  ButtonGroup,
  ConnectRunView,
  Divider,
  IconButton,
  Select,
  Slider,
  type ConnectItem,
  type SelectOption,
} from "./component";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

const SUBJECTS = ["语文", "数学", "英语", "物理", "道法", "政治", "习思想", "地理", "生物"];

const ASSIGN_TYPES = ["书面作业", "背诵作业", "阅读作业", "练习作业", "实践作业"];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

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
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorClosing, setEditorClosing] = useState(false);
  const [editorSubjectIdx, setEditorSubjectIdx] = useState(0);
  const [editorTypeIdx, setEditorTypeIdx] = useState(0);
  const [editorContent, setEditorContent] = useState("");
  const [fonts, setFonts] = useState<string[]>(["MiSans"]);
  const [fontFamilyIdx, setFontFamilyIdx] = useState(0);
  const [fontSizeIdx, setFontSizeIdx] = useState(2);
  const editorAreaRef = useRef<HTMLDivElement>(null);
  const [Watermark, setWatermark] = useState<ComponentType | null>(null);

  useEffect(() => {
    const onResize = () => setStacked(window.innerWidth <= 750);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    import("./Watermark")
      .then((m) => setWatermark(() => m.default))
      .catch(() => {});
  }, []);

  useEffect(() => {
    invoke<string[]>("get_system_fonts")
      .then((list) => { if (list.length > 0) setFonts(list); })
      .catch(() => setFonts(["MiSans", "Arial", "Helvetica", "PingFang SC", "Times New Roman", "Georgia"]));
  }, []);

  function execFmt(cmd: string) {
    editorAreaRef.current?.focus();
    document.execCommand(cmd);
    setEditorContent(editorAreaRef.current?.innerText ?? "");
  }

  function applyFontFamily(idx: number) {
    setFontFamilyIdx(idx);
    editorAreaRef.current?.focus();
    document.execCommand("fontName", false, fonts[idx] ?? "MiSans");
    setEditorContent(editorAreaRef.current?.innerText ?? "");
  }

  function applyFontSize(idx: number) {
    setFontSizeIdx(idx);
    const size = FONT_SIZES[idx];
    editorAreaRef.current?.focus();
    document.execCommand("fontSize", false, "7");
    const editor = editorAreaRef.current;
    if (editor) {
      editor.querySelectorAll('font[size="7"]').forEach((el) => {
        const span = document.createElement("span");
        span.style.fontSize = `${size}px`;
        while (el.firstChild) span.appendChild(el.firstChild);
        el.parentNode?.replaceChild(span, el);
      });
    }
    setEditorContent(editorAreaRef.current?.innerText ?? "");
  }

  function insertImage() {
    const url = window.prompt("输入图片链接");
    if (url) {
      editorAreaRef.current?.focus();
      document.execCommand("insertImage", false, url);
      setEditorContent(editorAreaRef.current?.innerText ?? "");
    }
  }

  function insertLink() {
    const url = window.prompt("输入链接地址");
    if (url) {
      editorAreaRef.current?.focus();
      document.execCommand("createLink", false, url);
      setEditorContent(editorAreaRef.current?.innerText ?? "");
    }
  }

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
    setEditorSubjectIdx(0);
    setEditorTypeIdx(0);
    setEditorContent("");
    if (editorAreaRef.current) {
      editorAreaRef.current.innerHTML = "";
    }
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorClosing(true);
  }

  function onEditorExit(e: React.AnimationEvent<HTMLDivElement>) {
    if (e.animationName === "editor-sheet-slide-down") {
      setEditorOpen(false);
      setEditorClosing(false);
    }
  }

  function handleAssign() {
    setEditorClosing(true);
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

      {editorOpen && (
        <div
          className={`editor-sheet-overlay${editorClosing ? " closing" : ""}`}
          onClick={closeEditor}
        >
          <div
            className={`editor-sheet${editorClosing ? " closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
            onAnimationEnd={onEditorExit}
          >
            <BottomSheet width={stacked ? 420 : 840} height={stacked ? 680 : 620}>
              <div className="editor-sheet-content">
                <div className="editor-sheet-title">布置作业</div>
                <div className="editor-sheet-row">
                  <Select
                    label="科目"
                    options={SUBJECTS.map((s) => ({ label: s, value: s })) as SelectOption[]}
                    selected={editorSubjectIdx}
                    onSelect={(i) => setEditorSubjectIdx(i)}
                    width={stacked ? 388 : 388}
                  />
                  <Select
                    label="作业类型"
                    options={ASSIGN_TYPES.map((t) => ({ label: t, value: t })) as SelectOption[]}
                    selected={editorTypeIdx}
                    onSelect={(i) => setEditorTypeIdx(i)}
                    width={stacked ? 388 : 388}
                  />
                </div>
                <Divider width={stacked ? 388 : 792} />
                <div className="editor-toolbar-top">
                  <ButtonGroup>
                    <IconButton icon="format_bold" toggle title="粗体" size={40} onClick={() => execFmt("bold")} />
                    <IconButton icon="format_strikethrough" toggle title="删除线" size={40} onClick={() => execFmt("strikeThrough")} />
                    <IconButton icon="format_underlined" toggle title="下划线" size={40} onClick={() => execFmt("underline")} />
                    <IconButton icon="format_italic" toggle title="斜体" size={40} onClick={() => execFmt("italic")} />
                    <IconButton icon="image" title="插入图片" size={40} onClick={insertImage} />
                    <IconButton icon="link" title="链接" size={40} onClick={insertLink} />
                  </ButtonGroup>
                  <Select
                    label="字体"
                    options={fonts.map((f) => ({ label: f, value: f })) as SelectOption[]}
                    selected={fontFamilyIdx}
                    onSelect={(i) => applyFontFamily(i)}
                    width={stacked ? 140 : 200}
                    height={44}
                  />
                  <Select
                    label="字号"
                    options={FONT_SIZES.map((s) => ({ label: `${s}px`, value: String(s) })) as SelectOption[]}
                    selected={fontSizeIdx}
                    onSelect={(i) => applyFontSize(i)}
                    width={100}
                    height={44}
                  />
                </div>
                <div className="editor-area">
                  <div
                    className="editor-area-input"
                    ref={editorAreaRef}
                    contentEditable
                    data-placeholder="在此输入作业内容..."
                    onInput={() => setEditorContent(editorAreaRef.current?.innerText ?? "")}
                  ></div>
                </div>
                <div className="editor-actions">
                  <button className="editor-btn editor-btn-text" onClick={closeEditor}>
                    取消
                  </button>
                  <button
                    className="editor-btn editor-btn-filled"
                    disabled={!editorContent.trim()}
                    onClick={handleAssign}
                  >
                    布置
                  </button>
                </div>
              </div>
            </BottomSheet>
          </div>
        </div>
      )}

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

      {Watermark && <Watermark />}
    </main>
  );
}

export default App;