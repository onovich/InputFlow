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

describe("InputFlow debug snapshot", () => {
  it("reports active contexts and consumed controls", () => {
    const input = createInputFlow({ maps: [gameplayMap, modalMap] });
    const virtual = new VirtualInputSource();
    input.addSource(virtual);
    input.activateContext({
      id: "runtimeGameplay",
      owner: "host-runtime",
      priority: 400,
      routing: "consumeMatched",
      maps: ["gameplay"]
    });
    input.activateContext({
      id: "modal",
      owner: "pause-menu",
      priority: 1000,
      routing: "consumeMatched",
      maps: ["modal"]
    });

    virtual.setButton("<Keyboard>/code/KeyE", true, 16);
    input.update(16);

    const debug = input.debugSnapshot();
    expect(debug.activeContexts.map((context) => context.owner)).toEqual([
      "pause-menu",
      "host-runtime"
    ]);
    expect(debug.consumedControls).toEqual(["<Keyboard>/code/KeyE"]);
    expect(debug.pressedControls.map((control) => control.control)).toEqual([
      "<Keyboard>/code/KeyE"
    ]);
    expect(debug.diagnostics).toMatchObject([
      {
        severity: "info",
        code: "CONTROL_CONSUMED",
        contextId: "modal",
        control: "<Keyboard>/code/KeyE"
      }
    ]);
  });

  it("reports exclusive context blocking", () => {
    const input = createInputFlow({ maps: [gameplayMap, modalMap] });
    const virtual = new VirtualInputSource();
    input.addSource(virtual);
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
      maps: ["modal"]
    });

    virtual.setButton("<Keyboard>/code/KeyE", true, 16);
    input.update(16);

    expect(input.debugSnapshot().diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      "CONTEXT_EXCLUSIVE_BLOCK"
    );
  });
});
