import type { ControlPath, DeviceId, SourceId } from "./ids.js";

export interface Vector2Value {
  readonly x: number;
  readonly y: number;
}

export type RawInputValue = number | Vector2Value;

export interface RawInputEvent {
  readonly sourceId: SourceId;
  readonly deviceId: DeviceId;
  readonly control: ControlPath;
  readonly value: RawInputValue;
  readonly timeMs: number;
  readonly sequence: number;
}

export type RawInputEventInit = Omit<RawInputEvent, "sequence"> & {
  readonly sequence?: number;
};

export const isVector2Value = (value: RawInputValue): value is Vector2Value =>
  typeof value === "object" &&
  value !== null &&
  Number.isFinite(value.x) &&
  Number.isFinite(value.y);

export const assertFiniteTime = (timeMs: number): void => {
  if (!Number.isFinite(timeMs) || timeMs < 0) {
    throw new Error(`Raw input event time must be a non-negative finite number: ${timeMs}`);
  }
};

export const assertRawInputValue = (value: RawInputValue): void => {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(`Raw input scalar value must be finite: ${value}`);
    }
    return;
  }

  if (!isVector2Value(value)) {
    throw new Error("Raw input vector value must contain finite x and y numbers");
  }
};
