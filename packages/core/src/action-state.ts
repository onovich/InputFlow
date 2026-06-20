import type { ActionId, ControlPath } from "./ids.js";

export type ActionValueType = "button" | "axis1d" | "axis2d";

export interface ButtonActionState {
  readonly actionId: ActionId;
  readonly value: number;
  readonly isPressed: boolean;
  readonly justPressed: boolean;
  readonly justReleased: boolean;
  readonly heldMs: number;
  readonly lastChangedAt: number;
  readonly sourceControl?: ControlPath;
}

export const createReleasedButtonState = (actionId: ActionId): ButtonActionState => ({
  actionId,
  value: 0,
  isPressed: false,
  justPressed: false,
  justReleased: false,
  heldMs: 0,
  lastChangedAt: 0
});
