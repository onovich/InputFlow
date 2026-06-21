import { describe, expect, it } from "vitest";
import {
  createInputFlow,
  type InputMapDefinition,
  type InteractionDefinition
} from "@inputflow/core";
import { VirtualInputSource } from "../src/index.js";

const createInteractionMap = (interaction: InteractionDefinition): InputMapDefinition => ({
  actions: [{ id: "runtime.gameplay.interact", valueType: "button" }],
  bindings: [
    {
      id: `interact.${interaction.type}`,
      action: "runtime.gameplay.interact",
      source: { kind: "control", path: "<Keyboard>/code/KeyE" },
      interactions: [interaction]
    }
  ]
});

const createRuntime = (interaction: InteractionDefinition) => {
  const input = createInputFlow({ maps: [createInteractionMap(interaction)] });
  const virtual = new VirtualInputSource();
  input.addSource(virtual);
  return { input, virtual };
};

describe("createInputFlow timed interactions", () => {
  it("does not turn an expired tap into a normal press/release", () => {
    const { input, virtual } = createRuntime({ type: "tap", maxDurationMs: 50 });

    virtual.setButton("<Keyboard>/code/KeyE", true, 0);
    input.update(0);
    expect(input.readButton("runtime.gameplay.interact")).toMatchObject({
      isPressed: false,
      justPressed: false,
      justReleased: false
    });

    virtual.setButton("<Keyboard>/code/KeyE", false, 100);
    input.update(100);
    expect(input.readButton("runtime.gameplay.interact")).toMatchObject({
      isPressed: false,
      justPressed: false,
      justReleased: false
    });
  });

  it("performs a tap as a one-frame pulse on valid release", () => {
    const { input, virtual } = createRuntime({ type: "tap", maxDurationMs: 50 });

    virtual.setButton("<Keyboard>/code/KeyE", true, 0);
    input.update(0);
    virtual.setButton("<Keyboard>/code/KeyE", false, 30);
    input.update(30);

    expect(input.readButton("runtime.gameplay.interact")).toMatchObject({
      isPressed: true,
      justPressed: true,
      justReleased: false,
      sourceControl: "<Keyboard>/code/KeyE"
    });

    input.update(31);
    expect(input.readButton("runtime.gameplay.interact")).toMatchObject({
      isPressed: false,
      justPressed: false,
      justReleased: true
    });
  });

  it("performs hold once when the injected frame time crosses the threshold", () => {
    const { input, virtual } = createRuntime({ type: "hold", minDurationMs: 100 });

    virtual.setButton("<Keyboard>/code/KeyE", true, 0);
    input.update(0);
    expect(input.readButton("runtime.gameplay.interact").isPressed).toBe(false);

    input.update(99);
    expect(input.readButton("runtime.gameplay.interact").isPressed).toBe(false);

    input.update(100);
    expect(input.readButton("runtime.gameplay.interact")).toMatchObject({
      isPressed: true,
      justPressed: true
    });

    input.update(101);
    expect(input.readButton("runtime.gameplay.interact")).toMatchObject({
      isPressed: false,
      justReleased: true
    });
  });

  it("emits repeat pulses from injected frame time", () => {
    const { input, virtual } = createRuntime({
      type: "repeat",
      delayMs: 100,
      intervalMs: 50
    });

    virtual.setButton("<Keyboard>/code/KeyE", true, 0);
    input.update(0);
    expect(input.readButton("runtime.gameplay.interact")).toMatchObject({
      isPressed: true,
      justPressed: true
    });

    input.update(50);
    expect(input.readButton("runtime.gameplay.interact")).toMatchObject({
      isPressed: false,
      justReleased: true
    });

    input.update(100);
    expect(input.readButton("runtime.gameplay.interact")).toMatchObject({
      isPressed: true,
      justPressed: true
    });

    input.update(150);
    expect(input.readButton("runtime.gameplay.interact")).toMatchObject({
      isPressed: true,
      justPressed: true
    });
  });
});
