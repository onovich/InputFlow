import { describe, expect, it } from "vitest";
import type { InputMapDefinition } from "@inputflow/core";
import { runReplayTrace, type ReplayTrace } from "../src/index.js";

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

describe("runReplayTrace", () => {
  it("replays raw control events into action snapshot frames", () => {
    const trace: ReplayTrace = {
      schemaVersion: 1,
      kind: "raw-control-trace",
      clock: "relative-ms",
      events: [
        {
          t: 0,
          type: "context.activate",
          contextId: "runtimeGameplay",
          priority: 400,
          routing: "consumeMatched",
          maps: ["gameplay"]
        },
        { t: 16, type: "control", control: "<Keyboard>/code/KeyE", value: 1 },
        { t: 16, type: "frame" },
        { t: 48, type: "control", control: "<Keyboard>/code/KeyE", value: 0 },
        { t: 48, type: "frame" },
        { t: 64, type: "context.deactivate", contextId: "runtimeGameplay" }
      ]
    };

    expect(runReplayTrace({ maps: [gameplayMap], trace })).toMatchObject({
      schemaVersion: 1,
      kind: "action-snapshot-trace",
      frames: [
        {
          t: 16,
          buttons: {
            "runtime.gameplay.interact": {
              isPressed: true,
              justPressed: true,
              justReleased: false
            }
          }
        },
        {
          t: 48,
          buttons: {
            "runtime.gameplay.interact": {
              isPressed: false,
              justPressed: false,
              justReleased: true
            }
          }
        }
      ]
    });
  });

  it("replays context lifecycle deterministically", () => {
    const trace: ReplayTrace = {
      schemaVersion: 1,
      kind: "raw-control-trace",
      clock: "relative-ms",
      events: [
        { t: 0, type: "context.activate", contextId: "runtimeGameplay", priority: 400, maps: ["gameplay"] },
        { t: 0, type: "context.activate", contextId: "modal", priority: 1000, routing: "consumeMatched", maps: ["modal"] },
        { t: 16, type: "control", control: "<Keyboard>/code/KeyE", value: 1 },
        { t: 16, type: "frame" }
      ]
    };

    const first = runReplayTrace({ maps: [gameplayMap, modalMap], trace });
    const second = runReplayTrace({ maps: [gameplayMap, modalMap], trace });

    expect(first).toEqual(second);
    expect(first.frames[0]?.buttons["ui.confirm"]?.justPressed).toBe(true);
    expect(first.frames[0]?.buttons["runtime.gameplay.interact"]?.isPressed).toBe(false);
  });
});
