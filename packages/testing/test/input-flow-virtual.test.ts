import { describe, expect, it } from "vitest";
import { createInputFlow, type InputMapDefinition } from "@inputflow/core";
import { VirtualInputSource } from "../src/index.js";

const map: InputMapDefinition = {
  id: "default",
  actions: [{ id: "runtime.gameplay.interact", valueType: "button" }],
  bindings: [
    {
      id: "interact.keyboard",
      action: "runtime.gameplay.interact",
      source: { kind: "control", path: "<Keyboard>/code/KeyE" },
      interactions: [{ type: "press" }]
    }
  ]
};

const runInteractTrace = () => {
  const input = createInputFlow({ maps: [map] });
  const virtual = new VirtualInputSource();
  input.addSource(virtual);

  virtual.setButton("<Keyboard>/code/KeyE", true, 16);
  input.update(16);
  const pressed = input.readButton("runtime.gameplay.interact");

  input.update(32);
  const held = input.readButton("runtime.gameplay.interact");

  virtual.setButton("<Keyboard>/code/KeyE", false, 48);
  input.update(48);
  const released = input.readButton("runtime.gameplay.interact");

  input.dispose();
  return [pressed, held, released].map((state) => ({
    value: state.value,
    isPressed: state.isPressed,
    justPressed: state.justPressed,
    justReleased: state.justReleased,
    heldMs: state.heldMs,
    sourceControl: state.sourceControl
  }));
};

describe("createInputFlow with VirtualInputSource", () => {
  it("turns E press and release into button action snapshots", () => {
    expect(runInteractTrace()).toEqual([
      {
        value: 1,
        isPressed: true,
        justPressed: true,
        justReleased: false,
        heldMs: 0,
        sourceControl: "<Keyboard>/code/KeyE"
      },
      {
        value: 1,
        isPressed: true,
        justPressed: false,
        justReleased: false,
        heldMs: 16,
        sourceControl: "<Keyboard>/code/KeyE"
      },
      {
        value: 0,
        isPressed: false,
        justPressed: false,
        justReleased: true,
        heldMs: 0,
        sourceControl: "<Keyboard>/code/KeyE"
      }
    ]);
  });

  it("produces deterministic snapshots for the same virtual trace", () => {
    expect(runInteractTrace()).toEqual(runInteractTrace());
  });
});
