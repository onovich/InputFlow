import { describe, expect, it } from "vitest";
import {
  evaluateHold,
  evaluateRepeat,
  evaluateTap,
  initialHoldState,
  type RepeatInteractionState,
  type TapInteractionState
} from "../src/index.js";

describe("interaction timing machines", () => {
  it("performs tap when release happens inside the max duration", () => {
    let state: TapInteractionState = {};
    ({ state } = evaluateTap({ state, value: 1, timeMs: 100, maxDurationMs: 120 }));
    const result = evaluateTap({ state, value: 0, timeMs: 200, maxDurationMs: 120 });

    expect(result.performed).toBe(true);
    expect(result.state).toEqual({});
  });

  it("rejects tap when held too long", () => {
    let state: TapInteractionState = {};
    ({ state } = evaluateTap({ state, value: 1, timeMs: 100, maxDurationMs: 50 }));

    expect(evaluateTap({ state, value: 0, timeMs: 200, maxDurationMs: 50 }).performed).toBe(false);
  });

  it("performs hold exactly once after injected time crosses the threshold", () => {
    let state = initialHoldState;
    ({ state } = evaluateHold({ state, value: 1, timeMs: 0, minDurationMs: 300 }));

    const before = evaluateHold({ state, value: 1, timeMs: 299, minDurationMs: 300 });
    const atBoundary = evaluateHold({ state: before.state, value: 1, timeMs: 300, minDurationMs: 300 });
    const after = evaluateHold({ state: atBoundary.state, value: 1, timeMs: 600, minDurationMs: 300 });

    expect(before.performed).toBe(false);
    expect(atBoundary.performed).toBe(true);
    expect(after.performed).toBe(false);
  });

  it("performs repeat from injected frame time", () => {
    let state: RepeatInteractionState = {};
    let result = evaluateRepeat({ state, value: 1, timeMs: 0, delayMs: 100, intervalMs: 50 });
    expect(result.performed).toBe(true);

    state = result.state;
    result = evaluateRepeat({ state, value: 1, timeMs: 99, delayMs: 100, intervalMs: 50 });
    expect(result.performed).toBe(false);

    result = evaluateRepeat({ state: result.state, value: 1, timeMs: 100, delayMs: 100, intervalMs: 50 });
    expect(result.performed).toBe(true);
    expect(result.state.nextRepeatAt).toBe(150);
  });
});
