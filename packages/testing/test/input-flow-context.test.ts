import { describe, expect, it } from "vitest";
import { createInputFlow, type InputMapDefinition } from "@inputflow/core";

const map: InputMapDefinition = {
  actions: [{ id: "runtime.gameplay.interact", valueType: "button" }],
  bindings: [
    {
      id: "interact.keyboard",
      action: "runtime.gameplay.interact",
      source: { kind: "control", path: "<Keyboard>/code/KeyE" }
    }
  ]
};

describe("InputFlow context leases", () => {
  it("exposes active context lifecycle through createInputFlow", () => {
    const input = createInputFlow({ maps: [map] });
    const lease = input.activateContext({
      id: "runtimeGameplay",
      owner: "host-runtime",
      priority: 400
    });

    expect(input.activeContexts()).toMatchObject([
      { id: "runtimeGameplay", owner: "host-runtime", priority: 400 }
    ]);

    lease.dispose();
    expect(input.activeContexts()).toEqual([]);
  });
});
