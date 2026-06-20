import type { RawInputValue, Vector2Value } from "../raw-event.js";

export type ProcessorDefinition =
  | { readonly type: "deadzone"; readonly min?: number }
  | { readonly type: "radialDeadzone"; readonly min?: number; readonly max?: number }
  | { readonly type: "normalize2d" }
  | { readonly type: "scale"; readonly factor: number }
  | { readonly type: "invert" }
  | { readonly type: "clamp"; readonly min: number; readonly max: number };

const clampNumber = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const mapValue = (
  value: RawInputValue,
  mapper: (component: number) => number
): RawInputValue =>
  typeof value === "number"
    ? mapper(value)
    : { x: mapper(value.x), y: mapper(value.y) };

export const deadzone = (value: number, min = 0.1): number =>
  Math.abs(value) < min ? 0 : value;

export const radialDeadzone = (
  value: Vector2Value,
  min = 0.1,
  max = 1
): Vector2Value => {
  const magnitude = Math.hypot(value.x, value.y);
  if (magnitude <= min) {
    return { x: 0, y: 0 };
  }

  const normalizedMagnitude = clampNumber((magnitude - min) / (max - min), 0, 1);
  const scale = normalizedMagnitude / magnitude;
  return {
    x: value.x * scale,
    y: value.y * scale
  };
};

export const normalize2d = (value: Vector2Value): Vector2Value => {
  const magnitude = Math.hypot(value.x, value.y);
  if (magnitude <= 1 || magnitude === 0) {
    return value;
  }
  return {
    x: value.x / magnitude,
    y: value.y / magnitude
  };
};

export const scaleValue = (value: RawInputValue, factor: number): RawInputValue =>
  mapValue(value, (component) => component * factor);

export const invertValue = (value: RawInputValue): RawInputValue =>
  mapValue(value, (component) => -component);

export const clampValue = (value: RawInputValue, min: number, max: number): RawInputValue =>
  mapValue(value, (component) => clampNumber(component, min, max));

export const applyProcessor = (
  value: RawInputValue,
  processor: ProcessorDefinition
): RawInputValue => {
  if (processor.type === "deadzone") {
    return typeof value === "number"
      ? deadzone(value, processor.min)
      : { x: deadzone(value.x, processor.min), y: deadzone(value.y, processor.min) };
  }

  if (processor.type === "radialDeadzone") {
    return radialDeadzone(
      typeof value === "number" ? { x: value, y: 0 } : value,
      processor.min,
      processor.max
    );
  }

  if (processor.type === "normalize2d") {
    return normalize2d(typeof value === "number" ? { x: value, y: 0 } : value);
  }

  if (processor.type === "scale") {
    return scaleValue(value, processor.factor);
  }

  if (processor.type === "invert") {
    return invertValue(value);
  }

  return clampValue(value, processor.min, processor.max);
};

export const applyProcessors = (
  value: RawInputValue,
  processors: readonly ProcessorDefinition[] = []
): RawInputValue =>
  processors.reduce((current, processor) => applyProcessor(current, processor), value);
