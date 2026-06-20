export const inputFlowBrowserPackage = "@inputflow/browser";

export {
  createGamepadSource,
  type BrowserGamepadButtonLike,
  type BrowserGamepadLike,
  type BrowserGamepadSource,
  type BrowserGamepadSourceOptions
} from "./gamepad-source.js";

export {
  createKeyboardSource,
  type BrowserKeyboardSource,
  type BrowserKeyboardSourceOptions
} from "./keyboard-source.js";

export {
  hasEventTargetShape,
  isEditableTarget,
  type BrowserEventTargetLike,
  type BrowserVisibilityTargetLike
} from "./event-target.js";

export {
  createPointerSource,
  type BrowserPointerSource,
  type BrowserPointerSourceOptions
} from "./pointer-source.js";
