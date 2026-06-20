import { describe, expect, it } from "vitest";
import {
  inputMapDocumentV0Schema,
  inputMapV0Schema,
  migrationDescriptorV0Schema,
  type InputMapDocumentV0,
  type SchemaMigrationHookV0
} from "../src/index.js";

describe("input map schema", () => {
  it("accepts a versioned document with actions, composites, processors, and interactions", () => {
    const parsed = inputMapDocumentV0Schema.parse({
      schemaVersion: 1,
      id: "sinan.default",
      maps: [
        {
          id: "gameplay",
          actions: [
            { id: "move", valueType: "axis2d", combine: "maxMagnitude" },
            { id: "interact", valueType: "button", bufferMs: 120 }
          ],
          bindings: [
            {
              id: "gameplay.move.wasd",
              action: "move",
              source: {
                kind: "composite2d",
                up: "<Keyboard>/code/KeyW",
                down: "<Keyboard>/code/KeyS",
                left: "<Keyboard>/code/KeyA",
                right: "<Keyboard>/code/KeyD"
              },
              processors: [{ type: "normalize2d" }]
            },
            {
              id: "gameplay.interact.keyboard",
              action: "interact",
              source: { kind: "control", path: "<Keyboard>/code/KeyE" },
              interactions: [{ type: "tap", maxDurationMs: 180 }]
            }
          ]
        }
      ]
    });

    expect(parsed.maps[0]?.bindings).toHaveLength(2);
  });

  it("accepts a single generic map shape for host adapters", () => {
    const parsed = inputMapV0Schema.parse({
      id: "default",
      actions: [{ id: "runtime.gameplay.interact", valueType: "button" }],
      bindings: [
        {
          id: "interact.keyboard",
          action: "runtime.gameplay.interact",
          source: { kind: "control", path: "<Keyboard>/code/KeyE" },
          interactions: [{ type: "press", pressPoint: 0.5, releasePoint: 0.25 }]
        }
      ]
    });

    expect(parsed.id).toBe("default");
  });

  it("rejects invalid controls and unknown processors", () => {
    const result = inputMapDocumentV0Schema.safeParse({
      schemaVersion: 1,
      maps: [
        {
          actions: [{ id: "move", valueType: "axis2d" }],
          bindings: [
            {
              id: "move.left",
              action: "move",
              source: { kind: "control", path: "Keyboard/code/KeyA" },
              processors: [{ type: "smooth" }]
            }
          ]
        }
      ]
    });

    expect(result.success).toBe(false);
  });

  it("leaves action resolution to the compiler diagnostics layer", () => {
    const result = inputMapV0Schema.safeParse({
      actions: [{ id: "known", valueType: "button" }],
      bindings: [
        {
          id: "broken",
          action: "missing",
          source: { kind: "control", path: "<Keyboard>/code/KeyE" }
        }
      ]
    });

    expect(result.success).toBe(true);
  });

  it("exposes a migration hook shape for load-time upgrades", () => {
    const descriptor = migrationDescriptorV0Schema.parse({
      kind: "input-map",
      fromVersion: 0,
      toVersion: 1
    });

    const hook: SchemaMigrationHookV0<InputMapDocumentV0> = {
      ...descriptor,
      migrate: () => ({ schemaVersion: 1, maps: [{ actions: [], bindings: [] }] })
    };

    expect(hook.migrate({}).schemaVersion).toBe(1);
  });
});
