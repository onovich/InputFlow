import { describe, expect, it } from "vitest";
import {
  DeviceState,
  asDeviceId,
  asSourceId,
  createControlPath,
  type RawInputEvent
} from "../src/index.js";

const sourceId = asSourceId("virtual");
const deviceId = asDeviceId("keyboard-0");
const keyE = createControlPath("<Keyboard>/code/KeyE");
const move = createControlPath("<Gamepad>/leftStick/main");

const event = (control = keyE, value: RawInputEvent["value"] = 1): RawInputEvent => ({
  sourceId,
  deviceId,
  control,
  value,
  timeMs: 16,
  sequence: 0
});

describe("DeviceState", () => {
  it("stores scalar control values from raw events", () => {
    const state = new DeviceState();

    state.apply(event(keyE, 1));

    expect(state.read(keyE)).toBe(1);
    expect(state.readScalar(keyE)).toBe(1);
  });

  it("stores vector values without treating them as actions", () => {
    const state = new DeviceState();

    state.apply(event(move, { x: 0.25, y: -0.5 }));

    expect(state.readVector2(move)).toEqual({ x: 0.25, y: -0.5 });
  });

  it("can reset known controls to neutral values", () => {
    const state = new DeviceState();

    state.apply(event(keyE, 1));
    state.resetAll(32);

    expect(state.read(keyE)).toBe(0);
    expect(state.entries()[0]?.changedAtMs).toBe(32);
  });
});
