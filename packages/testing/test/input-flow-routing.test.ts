import { describe, expect, it } from "vitest";
import { createInputFlow, type InputMapDefinition } from "@inputflow/core";
import { VirtualInputSource } from "../src/index.js";

const gameplayMap: InputMapDefinition = {
  id: "gameplay",
  actions: [{ id: "runtime.gameplay.interact", valueType: "button" }],
  bindings: [
    {
      id: "gameplay.interact.keyboard",
      action: "runtime.gameplay.interact",
      source: { kind: "control", path: "<Keyboard>/code/KeyE" }
    }
  ]
};

const modalMap: InputMapDefinition = {
  id: "modal",
  actions: [{ id: "ui.confirm", valueType: "button" }],
  bindings: [
    {
      id: "modal.confirm.keyboard",
      action: "ui.confirm",
      source: { kind: "control", path: "<Keyboard>/code/KeyE" }
    }
  ]
};

const passiveModalMap: InputMapDefinition = {
  id: "passiveModal",
  actions: [{ id: "ui.cancel", valueType: "button" }],
  bindings: [
    {
      id: "modal.cancel.keyboard",
      action: "ui.cancel",
      source: { kind: "control", path: "<Keyboard>/code/Escape" }
    }
  ]
};

const createRoutedInput = (maps: readonly InputMapDefinition[] = [gameplayMap, modalMap]) => {
  const input = createInputFlow({ maps });
  const virtual = new VirtualInputSource();
  input.addSource(virtual);
  return { input, virtual };
};

describe("InputFlow context routing", () => {
  it("lets shared contexts observe the same control", () => {
    const { input, virtual } = createRoutedInput();
    input.activateContext({ id: "gameplay", priority: 400, routing: "shared", maps: ["gameplay"] });
    input.activateContext({ id: "modal", priority: 1000, routing: "shared", maps: ["modal"] });

    virtual.setButton("<Keyboard>/code/KeyE", true, 16);
    input.update(16);

    expect(input.readButton("runtime.gameplay.interact").justPressed).toBe(true);
    expect(input.readButton("ui.confirm").justPressed).toBe(true);
  });

  it("uses consumeMatched to isolate modal input from gameplay", () => {
    const { input, virtual } = createRoutedInput();
    input.activateContext({
      id: "runtimeGameplay",
      priority: 400,
      routing: "consumeMatched",
      maps: ["gameplay"]
    });
    input.activateContext({
      id: "modal",
      priority: 1000,
      routing: "consumeMatched",
      maps: ["modal"]
    });

    virtual.setButton("<Keyboard>/code/KeyE", true, 16);
    input.update(16);

    expect(input.readButton("ui.confirm").justPressed).toBe(true);
    expect(input.readButton("runtime.gameplay.interact").isPressed).toBe(false);
  });

  it("blocks lower-priority contexts with exclusive routing", () => {
    const { input, virtual } = createRoutedInput([gameplayMap, passiveModalMap]);
    input.activateContext({
      id: "runtimeGameplay",
      priority: 400,
      routing: "consumeMatched",
      maps: ["gameplay"]
    });
    input.activateContext({
      id: "modal",
      priority: 1000,
      routing: "exclusive",
      maps: ["passiveModal"]
    });

    virtual.setButton("<Keyboard>/code/KeyE", true, 16);
    input.update(16);

    expect(input.readButton("runtime.gameplay.interact").isPressed).toBe(false);
    expect(input.readButton("ui.cancel").isPressed).toBe(false);
  });
});
