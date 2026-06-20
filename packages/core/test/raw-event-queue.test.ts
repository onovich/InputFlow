import { describe, expect, it } from "vitest";
import {
  RawEventQueue,
  asDeviceId,
  asSourceId,
  createControlPath
} from "../src/index.js";

const sourceId = asSourceId("virtual");
const deviceId = asDeviceId("keyboard-0");
const keyE = createControlPath("<Keyboard>/code/KeyE");
const keyF = createControlPath("<Keyboard>/code/KeyF");

describe("RawEventQueue", () => {
  it("assigns FIFO sequence numbers when source events omit them", () => {
    const queue = new RawEventQueue();

    const first = queue.enqueue({ sourceId, deviceId, control: keyE, value: 1, timeMs: 16 });
    const second = queue.enqueue({ sourceId, deviceId, control: keyF, value: 1, timeMs: 16 });

    expect(first.sequence).toBe(0);
    expect(second.sequence).toBe(1);
    expect(queue.size).toBe(2);
  });

  it("drains events sorted by time and sequence", () => {
    const queue = new RawEventQueue();

    queue.enqueue({ sourceId, deviceId, control: keyE, value: 0, timeMs: 32, sequence: 2 });
    queue.enqueue({ sourceId, deviceId, control: keyE, value: 1, timeMs: 16, sequence: 3 });
    queue.enqueue({ sourceId, deviceId, control: keyF, value: 1, timeMs: 32, sequence: 1 });

    expect(queue.drainSorted().map((event) => [event.timeMs, event.sequence])).toEqual([
      [16, 3],
      [32, 1],
      [32, 2]
    ]);
    expect(queue.size).toBe(0);
  });

  it("validates event time, sequence, and values at the queue boundary", () => {
    const queue = new RawEventQueue();

    expect(() =>
      queue.enqueue({ sourceId, deviceId, control: keyE, value: Number.NaN, timeMs: 16 })
    ).toThrow("finite");
    expect(() =>
      queue.enqueue({ sourceId, deviceId, control: keyE, value: 1, timeMs: -1 })
    ).toThrow("non-negative");
    expect(() =>
      queue.enqueue({ sourceId, deviceId, control: keyE, value: 1, timeMs: 16, sequence: -1 })
    ).toThrow("non-negative integer");
  });
});
