/**
 * MD3E (Material 3 Expressive) React 控件库
 * ------------------------------------------------------------------
 * 移植自 m3e-canvas 的 React 控件渲染层。
 *
 * 用法：
 *   import { Md3eProvider, Button, Card } from "./component";
 *
 *   <Md3eProvider palette="purple">
 *     <Button icon="add">新建</Button>
 *   </Md3eProvider>
 *
 * 所有控件都从 Md3eProvider 读取调色板 / 深浅色 / 形状刻度 / 强调字重，
 * 不引入任何动画库依赖，动效由 CSS 过渡完成。
 */

import "./md3e.css";

export * from "./tokens";
export * from "./color";
export { Md3eProvider, useMd3e, usePalette, useTheme, useWeight, PALETTES } from "./theme";
export type { Md3eThemeProps } from "./theme";

export { Icon } from "./Icon";
export type { IconProps } from "./Icon";

export { Pressable, RippleHost } from "./Pressable";
export type { PressableProps } from "./Pressable";

export { RippleProvider, RippleShape, Ripples, useRipples, rippleSize, RIPPLE_GROW } from "./Ripple";
export type { Ripple, RippleApi } from "./Ripple";

export { Button, IconButton, Fab, ExtendedFab, ButtonGroup } from "./Buttons";
export type { ButtonProps, IconButtonProps, FabProps, ExtendedFabProps } from "./Buttons";

export { Chip } from "./Chip";
export type { ChipProps } from "./Chip";

export { SplitButton } from "./SplitButton";
export type { SplitButtonProps, SplitMenuItem } from "./SplitButton";

export { FabMenu } from "./FabMenu";
export type { FabMenuProps, FabMenuItem } from "./FabMenu";

export { TopAppBar, BottomNav, NavRail, Toolbar, Tabs, SearchBar } from "./Navigation";
export type {
  TopAppBarProps,
  BottomNavProps,
  NavRailProps,
  ToolbarProps,
  TabsProps,
  SearchBarProps,
  NavDestination,
} from "./Navigation";

export { Box, BottomSheet, Card, ListItem, Dialog, Snackbar } from "./Containment";
export type {
  BoxProps,
  BottomSheetProps,
  CardProps,
  CardImagePos,
  CardAlign,
  ListItemProps,
  DialogProps,
  SnackbarProps,
} from "./Containment";

export { TextField, Select } from "./Fields";
export type { TextFieldProps, SelectProps, SelectOption } from "./Fields";

export { Switch, Checkbox, Radio, RadioGroup, Slider } from "./Choice";
export type { SwitchProps, CheckboxProps, RadioProps, RadioGroupProps, SliderProps } from "./Choice";

export { LoadingIndicator, LinearProgress, CircularProgress } from "./Progress";
export type { LoadingIndicatorProps, LinearProgressProps, CircularProgressProps } from "./Progress";

export { Text, ImageView, CameraView, MapView, Divider, Carousel, cardWidths, carouselShapes } from "./Content";
export type { TextProps, ImageViewProps, CameraViewProps, MapViewProps, DividerProps, CarouselProps, CarouselCard, CarouselLayout } from "./Content";

export { DatePicker, TimePicker } from "./Pickers";
export type { DatePickerProps, TimePickerProps, DateLayout, TimeLayout } from "./Pickers";

export {
  CONNECT_SPECS,
  ConnectItemView,
  ConnectRunBody,
  ConnectRunView,
  ConnectRules,
  ConnectSpacingProbe,
  ConnectStage,
  baseRadiiOf,
  canJoin,
  connectSpecOf,
  connectable,
  explodeRuns,
  fieldOf,
  findGuide,
  findSnap,
  judgeRun,
  layoutOfRun,
  matchRunSize,
  near,
  prefixOf,
  radiiOfRuns,
  restPosOf,
  runBand,
  runRadii,
  runSpan,
  sizeOf,
} from "./Connect";
export type {
  ConnectItem,
  ConnectItemViewProps,
  ConnectKind,
  ConnectRulesProps,
  ConnectRun,
  ConnectRunBodyProps,
  ConnectRunViewProps,
  ConnectStageProps,
  Guide,
  Placed,
  Size,
  Snap,
} from "./Connect";
