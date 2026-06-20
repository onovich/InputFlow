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

export interface Axis1DActionState {
  readonly actionId: ActionId;
  readonly value: number;
  readonly previousValue: number;
  readonly delta: number;
  readonly magnitude: number;
  readonly changed: boolean;
  readonly sourceControl?: ControlPath;
}

export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export interface Axis2DActionState {
  readonly actionId: ActionId;
  readonly value: Vector2;
  readonly previousValue: Vector2;
  readonly delta: Vector2;
  readonly magnitude: number;
  readonly changed: boolean;
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

export const createNeutralAxis1DState = (actionId: ActionId): Axis1DActionState => ({
  actionId,
  value: 0,
  previousValue: 0,
  delta: 0,
  magnitude: 0,
  changed: false
});

export const createNeutralAxis2DState = (actionId: ActionId): Axis2DActionState => ({
  actionId,
  value: { x: 0, y: 0 },
  previousValue: { x: 0, y: 0 },
  delta: { x: 0, y: 0 },
  magnitude: 0,
  changed: false
});

export const updateAxis1DState = (
  actionId: ActionId,
  previous: Axis1DActionState,
  value: number,
  sourceControl?: ControlPath
): Axis1DActionState => {
  const delta = value - previous.value;
  const state = {
    actionId,
    value,
    previousValue: previous.value,
    delta,
    magnitude: Math.abs(value),
    changed: delta !== 0
  };

  return sourceControl ? { ...state, sourceControl } : state;
};

export const updateAxis2DState = (
  actionId: ActionId,
  previous: Axis2DActionState,
  value: Vector2,
  sourceControl?: ControlPath
): Axis2DActionState => {
  const delta = {
    x: value.x - previous.value.x,
    y: value.y - previous.value.y
  };
  const state = {
    actionId,
    value,
    previousValue: previous.value,
    delta,
    magnitude: Math.hypot(value.x, value.y),
    changed: delta.x !== 0 || delta.y !== 0
  };

  return sourceControl ? { ...state, sourceControl } : state;
};
