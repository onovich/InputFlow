import { describe, expect, it } from "vitest";
import { DeviceState, RawEventQueue, createControlPath } from "@inputflow/core";
import { VirtualInputSource } from "../src/index.js";

describe("VirtualInputSource", () => {
  it("injects button values into the raw event queue without DOM", () => {
    const queue = new RawEventQueue();
    const source = new VirtualInputSource({ id: "test-source", deviceId: "keyboard-0" });
    const keyE = createControlPath("<Keyboard>/code/KeyE");

    source.connect({ push: (event) => queue.enqueue(event) });
    source.setButton(keyE, true, 16);
    source.setButton(keyE, false, 32);

    expect(queue.drainSorted().map((event) => event.value)).toEqual([1, 0]);
  });

  it("can drive DeviceState through normalized raw events", () => {
    const queue = new RawEventQueue();
    const deviceState = new DeviceState();
    const source = new VirtualInputSource();
    const keyE = "<Keyboard>/code/KeyE";

    source.connect({ push: (event) => queue.enqueue(event) });
    source.setButton(keyE, true, 16);
    for (const event of queue.drainSorted()) {
      deviceState.apply(event);
    }

    expect(deviceState.read(createControlPath(keyE))).toBe(1);
  });

  it("requires an explicit connection before emitting events", () => {
    const source = new VirtualInputSource();

    expect(() => source.setButton("<Keyboard>/code/KeyE", true, 16)).toThrow("connected");
  });
});
