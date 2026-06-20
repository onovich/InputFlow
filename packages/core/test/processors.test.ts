import { describe, expect, it } from "vitest";
import {
  applyProcessors,
  clampValue,
  deadzone,
  invertValue,
  normalize2d,
  radialDeadzone,
  scaleValue
} from "../src/index.js";

describe("processors", () => {
  it("applies scalar deadzone, scale, invert, and clamp as pure transforms", () => {
    expect(deadzone(0.05, 0.1)).toBe(0);
    expect(scaleValue(0.5, 2)).toBe(1);
    expect(invertValue(0.5)).toBe(-0.5);
    expect(clampValue(2, -1, 1)).toBe(1);
  });

  it("applies radial deadzone", () => {
    expect(radialDeadzone({ x: 0.1, y: 0 }, 0.2)).toEqual({ x: 0, y: 0 });
    expect(radialDeadzone({ x: 0.6, y: 0 }, 0.2, 1)).toEqual({ x: 0.49999999999999994, y: 0 });
  });

  it("normalizes vector magnitude above one", () => {
    const normalized = normalize2d({ x: 1, y: 1 });

    expect(Math.hypot(normalized.x, normalized.y)).toBeCloseTo(1);
  });

  it("runs processor pipelines deterministically", () => {
    expect(
      applyProcessors(0.2, [
        { type: "deadzone", min: 0.1 },
        { type: "scale", factor: 2 },
        { type: "clamp", min: -0.25, max: 0.25 }
      ])
    ).toBe(0.25);
  });
});
