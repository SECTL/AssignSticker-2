import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { AppBarElement } from "@material/web/labs/gb/components/appbar/app-bar-element.js";
import type { BadgeElement } from "@material/web/labs/gb/components/badge/badge-element.js";
import type { ButtonElement } from "@material/web/labs/gb/components/button/button-element.js";
import type { CardElement } from "@material/web/labs/gb/components/card/card-element.js";
import type { CheckboxElement } from "@material/web/labs/gb/components/checkbox/checkbox-element.js";
import type { ChipElement } from "@material/web/labs/gb/components/chip/chip-element.js";
import type { DividerElement } from "@material/web/labs/gb/components/divider/divider-element.js";
import type { FabElement } from "@material/web/labs/gb/components/fab/fab-element.js";
import type { IconButtonElement } from "@material/web/labs/gb/components/iconbutton/icon-button-element.js";
import type { ListElement } from "@material/web/labs/gb/components/list/list-element.js";
import type { ListItemElement } from "@material/web/labs/gb/components/list/list-item-element.js";
import type { SwitchElement } from "@material/web/labs/gb/components/switch/switch-element.js";
import type { IconElement } from "@material/web/labs/gb/styles/icon/icon-element.js";
import type { IconButton } from "@material/web/iconbutton/icon-button.js";
import type { ElevatedButton } from "@material/web/button/internal/elevated-button.js";
import type { FilledButton } from "@material/web/button/internal/filled-button.js";
import type { FilledTonalButton } from "@material/web/button/internal/filled-tonal-button.js";
import type { OutlinedButton } from "@material/web/button/internal/outlined-button.js";
import type { TextButton } from "@material/web/button/internal/text-button.js";
import type { MdCheckbox } from "@material/web/checkbox/checkbox.js";
import type { MdDialog } from "@material/web/dialog/dialog.js";
import type { MdDivider } from "@material/web/divider/divider.js";
import type { MdFab } from "@material/web/fab/fab.js";
import type { MdIcon } from "@material/web/icon/icon.js";
import type { MdCircularProgress } from "@material/web/progress/circular-progress.js";
import type { MdLinearProgress } from "@material/web/progress/linear-progress.js";
import type { MdRadio } from "@material/web/radio/radio.js";
import type { MdSwitch } from "@material/web/switch/switch.js";
import type { FilledTextField } from "@material/web/textfield/internal/filled-text-field.js";
import type { OutlinedTextField } from "@material/web/textfield/internal/outlined-text-field.js";

type WebComponent<T> = DetailedHTMLProps<HTMLAttributes<T>, T>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "md-gb-app-bar": WebComponent<AppBarElement> & {
        size?: "sm" | "md" | "lg";
        variant?: "standard" | "search";
        scrolled?: boolean;
      };
      "md-gb-badge": WebComponent<BadgeElement> & { value?: number | string };
      "md-gb-button": WebComponent<ButtonElement> & {
        color?: "filled" | "elevated" | "tonal" | "outlined" | "text";
        size?: "xs" | "sm" | "md" | "lg" | "xl";
        square?: boolean;
        selected?: boolean;
        disabled?: boolean;
        type?: "button" | "submit" | "reset";
      };
      "md-gb-card": WebComponent<CardElement> & {
        color?: "elevated" | "filled" | "outlined";
        disabled?: boolean;
        interactive?: boolean;
      };
      "md-gb-checkbox": WebComponent<CheckboxElement> & {
        checked?: boolean;
        disabled?: boolean;
        indeterminate?: boolean;
      };
      "md-gb-chip": WebComponent<ChipElement> & {
        color?: "elevated" | "filled" | "outlined" | "tonal";
        selected?: boolean;
        disabled?: boolean;
      };
      "md-gb-divider": WebComponent<DividerElement>;
      "md-gb-fab": WebComponent<FabElement> & {
        color?:
          | "primary"
          | "primary-container"
          | "secondary"
          | "secondary-container"
          | "tertiary"
          | "tertiary-container";
        size?: "default" | "md" | "lg";
        variant?: "primary" | "secondary" | "tertiary" | "branded";
        disabled?: boolean;
      };
      "md-gb-icon": WebComponent<IconElement>;
      "md-gb-icon-button": WebComponent<IconButtonElement> & {
        color?: "filled" | "tonal" | "outlined" | "standard";
        size?: "xs" | "sm" | "md" | "lg" | "xl";
        square?: boolean;
        selected?: boolean;
        disabled?: boolean;
      };
      "md-gb-list": WebComponent<ListElement>;
      "md-gb-list-item": WebComponent<ListItemElement> & {
        checked?: boolean;
        disabled?: boolean;
      };
      "md-gb-menu": WebComponent<HTMLElement> & { open?: boolean };
      "md-gb-menu-item": WebComponent<HTMLElement> & {
        disabled?: boolean;
        selected?: boolean;
      };
      "md-gb-radio": WebComponent<HTMLElement> & { checked?: boolean; disabled?: boolean };
      "md-gb-split-button": WebComponent<HTMLElement>;
      "md-gb-switch": WebComponent<SwitchElement> & { selected?: boolean; disabled?: boolean };
      "md-icon-button": WebComponent<IconButton> & {
        variant?: "filled" | "filled-tonal" | "outlined" | "standard";
        selected?: boolean;
        disabled?: boolean;
        toggle?: boolean;
      };
      "md-fab": WebComponent<MdFab> & {
        variant?: "primary" | "secondary" | "tertiary";
        size?: "small" | "medium" | "large";
        label?: string;
        lowered?: boolean;
      };
      "md-elevated-button": WebComponent<ElevatedButton> & {
        disabled?: boolean;
        type?: "button" | "submit" | "reset";
      };
      "md-filled-button": WebComponent<FilledButton> & {
        disabled?: boolean;
        type?: "button" | "submit" | "reset";
      };
      "md-filled-tonal-button": WebComponent<FilledTonalButton> & {
        disabled?: boolean;
        type?: "button" | "submit" | "reset";
      };
      "md-outlined-button": WebComponent<OutlinedButton> & {
        disabled?: boolean;
        type?: "button" | "submit" | "reset";
      };
      "md-text-button": WebComponent<TextButton> & {
        disabled?: boolean;
        type?: "button" | "submit" | "reset";
      };
      "md-checkbox": WebComponent<MdCheckbox> & {
        checked?: boolean;
        disabled?: boolean;
        indeterminate?: boolean;
      };
      "md-divider": WebComponent<MdDivider> & { vertical?: boolean };
      "md-dialog": WebComponent<MdDialog> & {
        open?: boolean;
        type?: "alert" | "fullscreen" | "standard";
        scrimClickAction?: string;
        escapeKeyAction?: string;
        onClosed?: () => void;
        onCancel?: () => void;
      };
      "md-radio": WebComponent<MdRadio> & {
        checked?: boolean;
        value?: string;
        name?: string;
        disabled?: boolean;
      };
      "md-icon": WebComponent<MdIcon>;
      "md-circular-progress": WebComponent<MdCircularProgress> & {
        indeterminate?: boolean;
        value?: number;
        fourColor?: boolean;
      };
      "md-linear-progress": WebComponent<MdLinearProgress> & {
        indeterminate?: boolean;
        value?: number;
      };
      "md-switch": WebComponent<MdSwitch> & { selected?: boolean; disabled?: boolean };
      "md-filled-text-field": WebComponent<FilledTextField> & {
        label?: string;
        value?: string;
        disabled?: boolean;
        required?: boolean;
        type?: string;
        placeholder?: string;
      };
      "md-outlined-text-field": WebComponent<OutlinedTextField> & {
        label?: string;
        value?: string;
        disabled?: boolean;
        required?: boolean;
        type?: string;
        placeholder?: string;
      };
    }
  }
}
