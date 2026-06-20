import { describe, expect, it } from "vitest";
import { replayTraceV0Schema } from "../src/index.js";

describe("replayTraceV0Schema", () => {
  it("accepts control, context lifecycle, and frame events", () => {
    const parsed = replayTraceV0Schema.parse({
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
        { t: 32, type: "frame" },
        { t: 48, type: "context.deactivate", contextId: "runtimeGameplay" }
      ]
    });

    expect(parsed.events).toHaveLength(4);
  });

  it("accepts vector control values", () => {
    const parsed = replayTraceV0Schema.parse({
      schemaVersion: 1,
      kind: "raw-control-trace",
      clock: "relative-ms",
      events: [
        { t: 16, type: "control", control: "<Gamepad>/leftStick/main", value: { x: 0.5, y: -1 } }
      ]
    });

    expect(parsed.events[0]).toMatchObject({
      type: "control",
      value: { x: 0.5, y: -1 }
    });
  });

  it("rejects invalid trace events", () => {
    const result = replayTraceV0Schema.safeParse({
      schemaVersion: 1,
      kind: "raw-control-trace",
      clock: "relative-ms",
      events: [
        { t: -1, type: "control", control: "Keyboard/code/KeyE", value: Number.NaN },
        { t: 16, type: "unknown" }
      ]
    });

    expect(result.success).toBe(false);
  });
});
