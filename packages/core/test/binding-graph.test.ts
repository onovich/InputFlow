import { describe, expect, it } from "vitest";
import { compileBindingGraph, createControlPath, type InputMapDefinition } from "../src/index.js";

const map: InputMapDefinition = {
  id: "default",
  actions: [{ id: "runtime.gameplay.interact", valueType: "button" }],
  bindings: [
    {
      id: "interact.keyboard",
      action: "runtime.gameplay.interact",
      source: { kind: "control", path: "<Keyboard>/code/KeyE" }
    }
  ]
};

describe("compileBindingGraph", () => {
  it("compiles button control bindings", () => {
    const graph = compileBindingGraph([map]);

    expect(graph.bindings).toHaveLength(1);
    expect(graph.bindings[0]?.control).toBe(createControlPath("<Keyboard>/code/KeyE"));
  });

  it("rejects unresolved actions", () => {
    expect(() =>
      compileBindingGraph([
        {
          actions: [],
          bindings: [
            {
              id: "broken",
              action: "missing",
              source: { kind: "control", path: "<Keyboard>/code/KeyE" }
            }
          ]
        }
      ])
    ).toThrow("unknown action");
  });

  it("indexes composite bindings by every contributing control", () => {
    const graph = compileBindingGraph([
      {
        actions: [{ id: "move", valueType: "axis2d" }],
        bindings: [
          {
            id: "move.wasd",
            action: "move",
            source: {
              kind: "composite2d",
              up: "<Keyboard>/code/KeyW",
              down: "<Keyboard>/code/KeyS",
              left: "<Keyboard>/code/KeyA",
              right: "<Keyboard>/code/KeyD"
            }
          }
        ]
      }
    ]);

    for (const control of ["KeyW", "KeyS", "KeyA", "KeyD"]) {
      expect(
        graph.bindingsByControl
          .get(createControlPath(`<Keyboard>/code/${control}`))
          ?.map((binding) => binding.id)
      ).toEqual(["move.wasd"]);
    }
  });
});
