import { describe, expect, it } from "vitest";
import { createInputFlow, type InputMapDefinition } from "@inputflow/core";
import { createKeyboardSource, inputFlowBrowserPackage } from "../src/index.js";

class FixtureTarget {
  visibilityState = "visible";
  private readonly listeners = new Map<string, Set<(event: Event) => void>>();

  addEventListener(type: string, listener: (event: Event) => void): void {
    const listeners = this.listeners.get(type) ?? new Set<(event: Event) => void>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: (event: Event) => void): void {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type: string, event: Partial<Event> & { readonly code?: string } = {}): void {
    const payload = { ...event, type } as Event;
    for (const listener of this.listeners.get(type) ?? []) {
      listener(payload);
    }
  }
}

const map: InputMapDefinition = {
  actions: [{ id: "interact", valueType: "button" }],
  bindings: [
    {
      id: "interact.keyboard",
      action: "interact",
      source: { kind: "control", path: "<Keyboard>/code/KeyE" }
    }
  ]
};

describe("browser keyboard source", () => {
  it("can be imported without touching browser globals", () => {
    expect(inputFlowBrowserPackage).toBe("@inputflow/browser");
  });

  it("pushes keyboard code controls into InputFlow", () => {
    const target = new FixtureTarget();
    const input = createInputFlow({ maps: [map] });
    input.addSource(createKeyboardSource({ target, now: () => 0 }));

    target.dispatch("keydown", { code: "KeyE", timeStamp: 10 });
    input.update(10);

    expect(input.readButton("interact")).toMatchObject({
      isPressed: true,
      justPressed: true,
      value: 1
    });

    target.dispatch("keyup", { code: "KeyE", timeStamp: 20 });
    input.update(20);

    expect(input.readButton("interact")).toMatchObject({
      isPressed: false,
      justReleased: true,
      value: 0
    });
  });

  it("releases pressed keys on blur so actions do not stick", () => {
    const target = new FixtureTarget();
    const input = createInputFlow({ maps: [map] });
    input.addSource(createKeyboardSource({ target, blurTarget: target, now: () => 20 }));

    target.dispatch("keydown", { code: "KeyE", timeStamp: 10 });
    input.update(10);
    expect(input.readButton("interact").isPressed).toBe(true);

    target.dispatch("blur", { timeStamp: 20 });
    input.update(20);

    expect(input.readButton("interact")).toMatchObject({
      isPressed: false,
      justReleased: true
    });
  });

  it("releases pressed keys when visibility becomes hidden", () => {
    const target = new FixtureTarget();
    const input = createInputFlow({ maps: [map] });
    input.addSource(createKeyboardSource({ target, visibilityTarget: target, now: () => 32 }));

    target.dispatch("keydown", { code: "KeyE", timeStamp: 10 });
    input.update(10);

    target.visibilityState = "hidden";
    target.dispatch("visibilitychange", { timeStamp: 32 });
    input.update(32);

    expect(input.readButton("interact").isPressed).toBe(false);
  });

  it("releases pressed keys on disconnect", () => {
    const target = new FixtureTarget();
    const input = createInputFlow({ maps: [map] });
    const keyboard = createKeyboardSource({ target, now: () => 40 });
    input.addSource(keyboard);

    target.dispatch("keydown", { code: "KeyE", timeStamp: 10 });
    input.update(10);
    keyboard.disconnect();
    input.update(40);

    expect(input.readButton("interact")).toMatchObject({
      isPressed: false,
      justReleased: true
    });
  });
});
