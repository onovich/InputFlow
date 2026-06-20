import { describe, expect, it } from "vitest";
import { createInputFlow, type InputMapDefinition } from "@inputflow/core";
import { createKeyboardSource, createPointerSource, isEditableTarget } from "../src/index.js";

class FixtureTarget {
  private readonly listeners = new Map<string, Set<(event: Event) => void>>();

  addEventListener(type: string, listener: (event: Event) => void): void {
    const listeners = this.listeners.get(type) ?? new Set<(event: Event) => void>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: (event: Event) => void): void {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type: string, event: Partial<Event> & Record<string, unknown> = {}): void {
    const payload = { ...event, type } as Event;
    for (const listener of this.listeners.get(type) ?? []) {
      listener(payload);
    }
  }
}

const actionMap: InputMapDefinition = {
  actions: [{ id: "interact", valueType: "button" }],
  bindings: [
    {
      id: "interact.keyboard",
      action: "interact",
      source: { kind: "control", path: "<Keyboard>/code/KeyE" }
    },
    {
      id: "interact.pointer",
      action: "interact",
      source: { kind: "control", path: "<Pointer>/button/primary" }
    }
  ]
};

const wheelMap: InputMapDefinition = {
  actions: [{ id: "scroll", valueType: "axis2d" }],
  bindings: [
    {
      id: "scroll.pointer",
      action: "scroll",
      source: { kind: "control", path: "<Pointer>/wheel/main" }
    }
  ]
};

describe("browser pointer source", () => {
  it("maps pointer primary and keyboard to the same action", () => {
    const target = new FixtureTarget();
    const input = createInputFlow({ maps: [actionMap] });
    input.addSource(createKeyboardSource({ target, now: () => 0 }));
    input.addSource(createPointerSource({ target, now: () => 0 }));

    target.dispatch("pointerdown", { button: 0, timeStamp: 10 });
    input.update(10);
    expect(input.readButton("interact").isPressed).toBe(true);

    target.dispatch("pointerup", { button: 0, timeStamp: 20 });
    input.update(20);
    expect(input.readButton("interact").isPressed).toBe(false);

    target.dispatch("keydown", { code: "KeyE", timeStamp: 30 });
    input.update(30);
    expect(input.readButton("interact").isPressed).toBe(true);
  });

  it("ignores pointer events from editable targets", () => {
    const target = new FixtureTarget();
    const input = createInputFlow({ maps: [actionMap] });
    input.addSource(createPointerSource({ target, now: () => 0 }));

    target.dispatch("pointerdown", {
      button: 0,
      target: { tagName: "input" },
      timeStamp: 10
    });
    input.update(10);

    expect(input.readButton("interact").isPressed).toBe(false);
  });

  it("ignores keyboard events from editable targets", () => {
    const target = new FixtureTarget();
    const input = createInputFlow({ maps: [actionMap] });
    input.addSource(createKeyboardSource({ target, now: () => 0 }));

    target.dispatch("keydown", {
      code: "KeyE",
      target: { isContentEditable: true },
      timeStamp: 10
    });
    input.update(10);

    expect(input.readButton("interact").isPressed).toBe(false);
  });

  it("detects editable targets through closest", () => {
    expect(
      isEditableTarget({
        closest: (selector: string) => selector.includes("contenteditable") ? {} : null
      })
    ).toBe(true);
  });

  it("accumulates wheel delta for one sampled frame", () => {
    const target = new FixtureTarget();
    const input = createInputFlow({ maps: [wheelMap] });
    input.addSource(createPointerSource({ target, now: () => 0 }));

    target.dispatch("wheel", { deltaX: 1, deltaY: -2, timeStamp: 10 });
    target.dispatch("wheel", { deltaX: 3, deltaY: 1, timeStamp: 12 });
    input.update(16);

    expect(input.readAxis2D("scroll")).toMatchObject({
      value: { x: 4, y: -1 },
      changed: true
    });

    input.update(32);

    expect(input.readAxis2D("scroll")).toMatchObject({
      value: { x: 0, y: 0 },
      changed: true
    });
  });
});
