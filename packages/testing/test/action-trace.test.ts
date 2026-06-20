import { describe, expect, it } from "vitest";
import type { InputMapDefinition } from "@inputflow/core";
import {
  assertActionSnapshotTrace,
  compareActionSnapshotTrace,
  runReplayTrace,
  type ActionSnapshotTrace,
  type ReplayTrace
} from "../src/index.js";

const map: InputMapDefinition = {
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

const trace: ReplayTrace = {
  schemaVersion: 1,
  kind: "raw-control-trace",
  clock: "relative-ms",
  events: [
    { t: 0, type: "context.activate", contextId: "runtimeGameplay", maps: ["gameplay"] },
    { t: 16, type: "control", control: "<Keyboard>/code/KeyE", value: 1 },
    { t: 16, type: "frame" },
    { t: 48, type: "control", control: "<Keyboard>/code/KeyE", value: 0 },
    { t: 48, type: "frame" }
  ]
};

const expectedTrace: ActionSnapshotTrace = {
  schemaVersion: 1,
  kind: "action-snapshot-trace",
  frames: [
    {
      t: 16,
      buttons: {
        "runtime.gameplay.interact": {
          value: 1,
          isPressed: true,
          justPressed: true,
          justReleased: false,
          heldMs: 0,
          sourceControl: "<Keyboard>/code/KeyE"
        }
      }
    },
    {
      t: 48,
      buttons: {
        "runtime.gameplay.interact": {
          value: 0,
          isPressed: false,
          justPressed: false,
          justReleased: true,
          heldMs: 0,
          sourceControl: "<Keyboard>/code/KeyE"
        }
      }
    }
  ]
};

describe("action snapshot trace assertions", () => {
  it("asserts exact replay output", () => {
    const actual = runReplayTrace({ maps: [map], trace });

    expect(compareActionSnapshotTrace(actual, expectedTrace).pass).toBe(true);
    expect(() => assertActionSnapshotTrace(actual, expectedTrace)).not.toThrow();
  });

  it("throws with mismatch details", () => {
    const actual = runReplayTrace({ maps: [map], trace });
    const expected: ActionSnapshotTrace = {
      ...expectedTrace,
      frames: []
    };

    expect(compareActionSnapshotTrace(actual, expected).pass).toBe(false);
    expect(() => assertActionSnapshotTrace(actual, expected)).toThrow("Action snapshot trace mismatch");
  });
});
