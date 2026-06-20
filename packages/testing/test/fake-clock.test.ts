import { describe, expect, it } from "vitest";
import { FakeClock } from "../src/index.js";

describe("FakeClock", () => {
  it("advances deterministic time without reading globals", () => {
    const clock = new FakeClock(16);

    expect(clock.now()).toBe(16);
    expect(clock.advance(8)).toBe(24);
    clock.set(32);
    expect(clock.now()).toBe(32);
  });

  it("rejects invalid times", () => {
    const clock = new FakeClock();

    expect(() => clock.set(-1)).toThrow("non-negative");
    expect(() => clock.advance(Number.NaN)).toThrow("finite");
  });
});
