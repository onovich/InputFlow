import type { ControlPath } from "./ids.js";
import type { RawInputEvent, RawInputValue, Vector2Value } from "./raw-event.js";

export interface ControlState {
  readonly control: ControlPath;
  readonly value: RawInputValue;
  readonly changedAtMs: number;
  readonly sourceControl?: ControlPath;
}

const zeroVector: Vector2Value = Object.freeze({ x: 0, y: 0 });

export class DeviceState {
  #controls = new Map<ControlPath, ControlState>();

  apply(event: RawInputEvent): ControlState {
    const state: ControlState = {
      control: event.control,
      value: event.value,
      changedAtMs: event.timeMs,
      sourceControl: event.control
    };
    this.#controls.set(event.control, state);
    return state;
  }

  read(control: ControlPath): RawInputValue {
    return this.#controls.get(control)?.value ?? 0;
  }

  readScalar(control: ControlPath): number {
    const value = this.read(control);
    return typeof value === "number" ? value : value.x;
  }

  readVector2(control: ControlPath): Vector2Value {
    const value = this.read(control);
    return typeof value === "number" ? zeroVector : value;
  }

  resetControl(control: ControlPath, timeMs: number): ControlState {
    const state: ControlState = {
      control,
      value: 0,
      changedAtMs: timeMs,
      sourceControl: control
    };
    this.#controls.set(control, state);
    return state;
  }

  resetAll(timeMs: number): ControlState[] {
    return [...this.#controls.keys()].map((control) => this.resetControl(control, timeMs));
  }

  entries(): ControlState[] {
    return [...this.#controls.values()];
  }

  clear(): void {
    this.#controls.clear();
  }
}
