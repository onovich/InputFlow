import { describe, expect, it } from "vitest";
import { createInputFlow, type InputMapDefinition } from "@inputflow/core";
import { VirtualInputSource } from "../src/index.js";

const map: InputMapDefinition = {
  id: "gameplay",
  actions: [
    { id: "runtime.gameplay.throttle", valueType: "axis1d" },
    { id: "runtime.gameplay.move", valueType: "axis2d" }
  ],
  bindings: [
    {
      id: "throttle.keys",
      action: "runtime.gameplay.throttle",
      source: {
        kind: "composite1d",
        negative: "<Keyboard>/code/KeyS",
        positive: "<Keyboard>/code/KeyW"
      }
    },
    {
      id: "move.wasd",
      action: "runtime.gameplay.move",
      source: {
        kind: "composite2d",
        up: "<Keyboard>/code/KeyW",
        down: "<Keyboard>/code/KeyS",
        left: "<Keyboard>/code/KeyA",
        right: "<Keyboard>/code/KeyD"
      },
      processors: [{ type: "normalize2d" }]
    }
  ]
};

describe("axis actions and composites", () => {
  it("reads composite1d values", () => {
    const input = createInputFlow({ maps: [map] });
    const virtual = new VirtualInputSource();
    input.addSource(virtual);

    virtual.setButton("<Keyboard>/code/KeyW", true, 16);
    input.update(16);

    expect(input.readAxis1D("runtime.gameplay.throttle")).toMatchObject({
      value: 1,
      previousValue: 0,
      delta: 1,
      magnitude: 1,
      changed: true,
      sourceControl: "<Keyboard>/code/KeyW"
    });
  });

  it("reads composite2d values", () => {
    const input = createInputFlow({ maps: [map] });
    const virtual = new VirtualInputSource();
    input.addSource(virtual);

    virtual.setButton("<Keyboard>/code/KeyW", true, 16);
    virtual.setButton("<Keyboard>/code/KeyD", true, 16);
    input.update(16);

    const move = input.readAxis2D("runtime.gameplay.move");
    expect(move.previousValue).toEqual({ x: 0, y: 0 });
    expect(move.changed).toBe(true);
    expect(move.value.x).toBeCloseTo(Math.SQRT1_2);
    expect(move.value.y).toBeCloseTo(Math.SQRT1_2);
    expect(move.delta.x).toBeCloseTo(Math.SQRT1_2);
    expect(move.delta.y).toBeCloseTo(Math.SQRT1_2);
    expect(move.magnitude).toBeCloseTo(1);
  });

  it("returns neutral axis state when controls are released", () => {
    const input = createInputFlow({ maps: [map] });
    const virtual = new VirtualInputSource();
    input.addSource(virtual);

    virtual.setButton("<Keyboard>/code/KeyW", true, 16);
    input.update(16);
    virtual.setButton("<Keyboard>/code/KeyW", false, 32);
    input.update(32);

    expect(input.readAxis1D("runtime.gameplay.throttle")).toMatchObject({
      value: 0,
      previousValue: 1,
      delta: -1,
      magnitude: 0,
      changed: true
    });
  });
});
