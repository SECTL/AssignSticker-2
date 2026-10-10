"use client";

/**
 * MD3E 控件库演示页：把移植过来的控件全部铺出来，
 * 顶部可以在调色板 / 深浅色 / 形状刻度 / 强调字重之间切换。
 */

import { useState } from "react";
import {
  BottomNav,
  BottomSheet,
  Box,
  Button,
  CameraView,
  Card,
  Carousel,
  Checkbox,
  Chip,
  CircularProgress,
  ConnectRunView,
  ConnectSpacingProbe,
  ConnectStage,
  DatePicker,
  Dialog,
  Divider,
  ExtendedFab,
  Fab,
  FabMenu,
  Icon,
  IconButton,
  ImageView,
  LinearProgress,
  ListItem,
  LoadingIndicator,
  MapView,
  Md3eProvider,
  NavRail,
  RadioGroup,
  SearchBar,
  Select,
  Slider,
  Snackbar,
  SplitButton,
  Switch,
  Tabs,
  Text,
  TextField,
  TimePicker,
  Toolbar,
  TopAppBar,
  useMd3e,
  type ConnectItem,
  type Contrast,
  type ShapeScale,
  PALETTES,
} from "./index";

/* ---------- 小工具：分区标题 ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { palette } = useMd3e();
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          color: palette.primary,
          margin: "0 0 16px",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const { palette } = useMd3e();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 12, color: palette.onSurfaceVariant }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>{children}</div>
    </div>
  );
}

/* ---------- 顶部控制条 ---------- */

const CONTRASTS: Contrast[] = ["standard", "medium", "high"];
const SHAPE_KEYS: ShapeScale[] = ["square", "rounded", "full"];

function Controls({
  state,
  set,
}: {
  state: { palette: string; dark: boolean; shape: ShapeScale; emphasized: boolean; contrast: Contrast };
  set: (patch: Partial<typeof state>) => void;
}) {
  const { palette } = useMd3e();
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "center",
        padding: "12px 20px",
        marginBottom: 28,
        background: palette.surfaceContainer,
        color: palette.onSurface,
        borderRadius: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {PALETTES.map((p) => (
          <span
            key={p.key}
            title={p.label}
            onClick={() => set({ palette: p.key })}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              background: p.primary,
              cursor: "pointer",
              outline: state.palette === p.key ? `2px solid ${palette.onSurface}` : "2px solid transparent",
              outlineOffset: 2,
            }}
          />
        ))}
      </div>

      <Chip label="深色" checked={state.dark} onChange={(v) => set({ dark: v })} />
      <Chip label="强调字重" checked={state.emphasized} onChange={(v) => set({ emphasized: v })} />

      <div style={{ display: "flex", gap: 8 }}>
        {CONTRASTS.map((c) => (
          <Chip
            key={c}
            label={c === "standard" ? "标准" : c === "medium" ? "中等对比" : "高对比"}
            checked={state.contrast === c}
            onChange={() => set({ contrast: c })}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {SHAPE_KEYS.map((s) => (
          <Chip
            key={s}
            label={s === "square" ? "方形" : s === "rounded" ? "圆角" : "全圆"}
            checked={state.shape === s}
            onChange={() => set({ shape: s })}
          />
        ))}
      </div>
    </div>
  );
}

/** 连通组用的固定素材：横向按钮一条、纵向列表一条、chip 一条 */
const BTN_RUN: ConnectItem[] = [
  { id: "d1", kind: "button", label: "分享", icon: "share", main: 108 },
  { id: "d2", kind: "button", label: "下载", icon: "download", main: 108 },
  { id: "d3", kind: "button", label: "更多", icon: "more_horiz", main: 108 },
];
const CHIP_RUN: ConnectItem[] = [
  { id: "d4", kind: "chip", label: "中等", main: 90 },
  { id: "d5", kind: "chip", label: "大份", main: 90 },
  { id: "d6", kind: "chip", label: "加辣", main: 90 },
];
const LIST_RUN: ConnectItem[] = [
  { id: "d7", kind: "listItem", label: "无线网络", supportingText: "已连接 · 5GHz", icon: "wifi", cross: 320, main: 72 },
  { id: "d8", kind: "listItem", label: "蓝牙", supportingText: "2 台设备", icon: "bluetooth", cross: 320, main: 72 },
  { id: "d9", kind: "listItem", label: "声音", supportingText: "媒体音量 60%", icon: "volume_up", cross: 320, main: 72 },
];

/* ---------- 演示主体 ---------- */

function Showcase() {
  const [selected, setSelected] = useState(0);
  const [chip, setChip] = useState(true);
  const [checked, setChecked] = useState(true);
  const [slider, setSlider] = useState(40);
  const [pull, setPull] = useState(0);
  const [tab, setTab] = useState(1);
  const [text, setText] = useState("");
  const [selectIdx, setSelectIdx] = useState<number | undefined>(undefined);
  const [radio, setRadio] = useState("b");

  return (
    <div style={{ padding: 24, maxWidth: 1180, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, margin: "0 0 4px" }}>MD3E 控件库</h1>
      <p style={{ fontSize: 14, opacity: 0.7, marginTop: 0 }}>
        移植自 m3e-canvas 的 Material 3 Expressive React 控件，不依赖任何动画库，动效全部由 CSS 过渡完成。
      </p>

      <Section title="Buttons">
        <Row label="Variant">
          <Button>Filled</Button>
          <Button variant="tonal" icon="add">
            Tonal
          </Button>
          <Button variant="elevated" icon="edit">
            Elevated
          </Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
        </Row>
        <Row label="Size（xs → xl）">
          <Button size={32} icon="add">
            XS
          </Button>
          <Button size={40} icon="add">
            S
          </Button>
          <Button size={56} icon="add">
            M
          </Button>
          <Button size={96} icon="add">
            L
          </Button>
          <Button size={136} icon="add">
            XL
          </Button>
        </Row>
        <Row label="Icon Button / FAB">
          <IconButton icon="favorite" />
          <IconButton icon="favorite" variant="filled" />
          <IconButton icon="favorite" variant="outlined" />
          <IconButton icon="favorite" variant="tonal" selected toggle title="已收藏" />
          <Fab icon="edit" />
          <Fab icon="edit" variant="filled" size={96} />
          <ExtendedFab label="新建" icon="add" />
          <ExtendedFab label="新建" icon="add" size={96} variant="filled" />
        </Row>
        <Row label="Split / Menu">
          <SplitButton
            label="发送"
            icon="send"
            menu={[
              { icon: "schedule", label: "定时发送" },
              { icon: "save", label: "存为草稿" },
              { icon: "delete", label: "删除" },
            ]}
          />
          <FabMenu
            icon="add"
            items={[
              { icon: "edit", label: "写便签" },
              { icon: "photo_camera", label: "拍照" },
              { icon: "mic", label: "录音" },
            ]}
          />
        </Row>
      </Section>

      <Section title="Chips">
        <Row label="Assist / Filter / Input">
          <Chip label="基础" icon="label" />
          <Chip label="已选" checked onChange={setChip} />
          <Chip label="变一下" checked={chip} onChange={setChip} />
          <Chip label="大号 Chip" size={56} icon="star" />
          <Chip label="Filled" variant="filled" icon="check" />
        </Row>
      </Section>

      <Section title="Navigation">
        <Row label="Top App Bar（small / medium / large）">
          <TopAppBar title="标题" icon="menu" icon2="more_vert" width={320} size={64} />
          <TopAppBar title="中等标题" icon="menu" icon2="more_vert" width={320} size={112} />
          <TopAppBar title="大标题" icon="menu" icon2="more_vert" width={320} size={152} />
        </Row>
        <Row label="Bottom Nav / Rail">
          <BottomNav
            destinations={[
              { icon: "home", label: "首页" },
              { icon: "search", label: "搜索" },
              { icon: "favorite", label: "收藏" },
              { icon: "person", label: "我的" },
            ]}
            selected={selected}
            onSelect={setSelected}
            width={360}
          />
          <NavRail
            destinations={[
              { icon: "home", label: "首页" },
              { icon: "search", label: "搜索" },
              { icon: "favorite", label: "收藏" },
              { icon: "person", label: "我的" },
            ]}
            selected={selected}
            onSelect={setSelected}
            height={280}
          />
          <NavRail
            destinations={[
              { icon: "home", label: "首页" },
              { icon: "search", label: "搜索" },
              { icon: "favorite", label: "收藏" },
              { icon: "person", label: "我的" },
            ]}
            selected={selected}
            onSelect={setSelected}
            expanded
            height={280}
          />
        </Row>
        <Row label="Tabs / Toolbar / Search">
          <Tabs
            tabs={[{ label: "概览" }, { label: "详情" }, { label: "评论" }]}
            selected={tab}
            onSelect={setTab}
            width={360}
          />
          <Toolbar items={[{ icon: "format_bold" }, { icon: "format_italic" }, { icon: "attach_file" }, { icon: "more_vert" }]} />
          <Toolbar variant="filled" items={[{ icon: "reply" }, { icon: "forward" }, { icon: "delete" }]} />
          <SearchBar value={text} onChange={setText} placeholder="搜索内容" />
        </Row>
      </Section>

      <Section title="Containment">
        <Card
          title="卡片标题"
          supportingText="这里是补充说明文字，最多两行就会被裁掉。"
          icon="image"
          width={300}
          height={200}
        />
        <Card
          title="带图片的卡片"
          supportingText="图片在顶部，文字在下方。"
          variant="outlined"
          imagePos="leading"
          icon="photo"
          width={300}
          height={140}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 340 }}>
          <ListItem label="列表项" supportingText="副标题" icon="person" onClick={() => {}} />
          <ListItem
            label="带开关的列表项"
            supportingText="右边是一个开关"
            icon="notifications"
            trailingSwitch
            checked={checked}
            onCheckedChange={setChecked}
          />
        </div>
        <Box width={200} height={140} fill="primaryContainer">
          <div style={{ display: "grid", placeItems: "center", height: "100%" }}>Box</div>
        </Box>
        <BottomSheet width={240} height={180} />
        <Dialog title="确认操作" supportingText="此操作不可撤销，确定继续吗？" icon="info" height={200} />
        <Snackbar message="已保存到草稿" actionText="撤销" />
      </Section>

      <Section title="Connect（吸附与连通组）">
        <Row label="横向 run：三个按钮融合成一条 —— 外圆内小，间距 3dp">
          <ConnectRunView axis="x" items={BTN_RUN} />
        </Row>
        <Row label="纵向 run：列表项堆叠（按钮吸不到它身上，族不同）">
          <ConnectRunView axis="y" items={LIST_RUN} />
        </Row>
        <Row label="chip 自成一族：与按钮、列表项都不融合">
          <ConnectRunView axis="x" items={CHIP_RUN} />
        </Row>
        <Row label={`拉力 pull = ${pull.toFixed(2)}：部件正在靠近时，run 的缺口随拉力连续变软`}>
          <ConnectRunView axis="x" items={BTN_RUN} pull={pull} />
          <Slider value={Math.round(pull * 100)} onChange={(v) => setPull(v / 100)} width={200} />
        </Row>
      </Section>

      <Section title="吸附舞台（拖动试试）">
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <ConnectStage width={720} height={420} withRules />
        </div>
      </Section>

      <Section title="间距决定连通">
        <ConnectSpacingProbe />
      </Section>

      <Section title="Inputs">
        <Row label="Text Field / Select">
          <TextField label="邮箱" icon="mail" supportingText="我们不会公开你的邮箱" width={280} />
          <TextField label="已填写" defaultValue="hello@example.com" variant="filled" width={280} />
          <Select
            label="城市"
            icon="location_on"
            selected={selectIdx}
            onSelect={(i) => setSelectIdx(i)}
            options={[{ label: "北京" }, { label: "上海" }, { label: "广州" }, { label: "深圳" }]}
            width={280}
          />
        </Row>
        <Row label="Switch / Checkbox / Radio">
          <Switch label="通知" checked={checked} onChange={setChecked} />
          <Checkbox label="同意条款" checked={checked} onChange={setChecked} />
          <Checkbox label="半选" indeterminate />
          <RadioGroup
            value={radio}
            onChange={setRadio}
            options={[
              { label: "选项 A", value: "a" },
              { label: "选项 B", value: "b" },
              { label: "选项 C", value: "c" },
            ]}
          />
        </Row>
        <Row label="Slider">
          <Slider value={slider} onChange={setSlider} width={320} />
          <span style={{ fontSize: 14 }}>{slider}</span>
        </Row>
        <Row label="Pickers">
          <DatePicker width={328} />
          <TimePicker width={328} />
        </Row>
      </Section>

      <Section title="Progress">
        <Row label="Loading">
          <LoadingIndicator color="#6750A4" size={48} />
          <LoadingIndicator color="#FFFFFF" size={64} contained containerColor="#6750A4" />
        </Row>
        <Row label="Linear（determinate / indeterminate / wavy）">
          <LinearProgress color="#6750A4" trackColor="#E8DEF8" width={300} value={0.6} />
          <LinearProgress color="#6750A4" trackColor="#E8DEF8" width={300} />
          <LinearProgress color="#6750A4" trackColor="#E8DEF8" width={300} value={0.4} wavy />
        </Row>
        <Row label="Circular">
          <CircularProgress color="#6750A4" trackColor="#E8DEF8" size={48} />
          <CircularProgress color="#6750A4" trackColor="#E8DEF8" size={64} value={0.7} />
          <CircularProgress color="#6750A4" trackColor="#E8DEF8" size={64} value={0.5} wavy />
        </Row>
      </Section>

      <Section title="Content">
        <Row label="Text / Divider">
          <Text size={45}>Display 45</Text>
          <Text size={28}>Headline 28</Text>
          <Text size={22}>Title 22</Text>
          <Text size={16}>Body 16</Text>
          <Text size={16} bold>
            Bold 16
          </Text>
        </Row>
        <div style={{ width: "100%" }}>
          <Divider width={860} />
        </div>
        <Row label="Image / Camera / Map">
          <ImageView size={160} />
          <CameraView width={213} />
          <MapView width={213} />
        </Row>
        <Row label="Carousel（可拖拽 / 两侧按钮翻页）">
          <Carousel
            width={412}
            height={180}
            layout="multiBrowse"
            cards={[
              { label: "第一张卡片" },
              { label: "第二张" },
              { label: "第三张" },
              { label: "第四张" },
              { label: "第五张" },
            ]}
          />
        </Row>
        <Row label="Carousel / hero">
          <Carousel width={412} height={200} layout="hero" cards={[{ label: "主卡" }, { label: "小卡" }, { label: "小卡" }]} />
        </Row>
      </Section>

      <Section title="Icons">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {["add", "check", "close", "search", "menu", "favorite", "home", "settings", "delete", "edit", "star", "photo_camera", "map", "mic", "notifications", "person", "send", "schedule"].map(
            (n) => (
              <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 72 }}>
                <Icon name={n} size={28} />
                <span style={{ fontSize: 10, opacity: 0.6, textAlign: "center" }}>{n}</span>
              </div>
            ),
          )}
        </div>
      </Section>
    </div>
  );
}

/* ---------- 入口 ---------- */

/** 演示页：自带主题控制条 */
export function Md3eDemo() {
  const [state, setState] = useState<{
    palette: string;
    dark: boolean;
    shape: ShapeScale;
    emphasized: boolean;
    contrast: Contrast;
  }>({ palette: "purple", dark: false, shape: "rounded", emphasized: false, contrast: "standard" });

  const set = (patch: Partial<typeof state>) => setState((s) => ({ ...s, ...patch }));

  return (
    <Md3eProvider
      palette={state.palette}
      dark={state.dark}
      shape={state.shape}
      emphasized={state.emphasized}
      contrast={state.contrast}
      fontFamily='"MiSans", Roboto, system-ui, -apple-system, sans-serif'
    >
      <div style={{ minHeight: "100vh", background: "var(--md3e-surface)", padding: "0 0 60px" }}>
        <div style={{ padding: 24, maxWidth: 1180, margin: "0 auto" }}>
          <Controls state={state} set={set} />
        </div>
        <Showcase />
      </div>
    </Md3eProvider>
  );
}

export default Md3eDemo;
