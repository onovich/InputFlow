import { describe, expect, it } from "vitest";
import { createInputFlow, type InputMapDefinition } from "@inputflow/core";
import {
  createGamepadSource,
  inputFlowBrowserPackage,
  type BrowserGamepadLike
} from "../src/index.js";

const map: InputMapDefinition = {
  actions: [
    { id: "confirm", valueType: "button" },
    { id: "move", valueType: "axis2d" }
  ],
  bindings: [
    {
      id: "confirm.gamepad",
      action: "confirm",
      source: { kind: "control", path: "<Gamepad>/button/south" }
    },
    {
      id: "move.gamepad",
      action: "move",
      source: { kind: "control", path: "<Gamepad>/stick/left" }
    }
  ]
};

const gamepad = (value: Partial<BrowserGamepadLike>): BrowserGamepadLike => ({
  connected: true,
  buttons: [],
  axes: [],
  ...value
});

describe("browser gamepad source", () => {
  it("can be imported and created without browser globals", () => {
    expect(inputFlowBrowserPackage).toBe("@inputflow/browser");
    expect(() => createGamepadSource()).not.toThrow();
  });

  it("polls the south button into InputFlow", () => {
    let pads: readonly BrowserGamepadLike[] = [
      gamepad({ buttons: [{ pressed: true, value: 1 }], axes: [0, 0] })
    ];
    const input = createInputFlow({ maps: [map] });
    input.addSource(createGamepadSource({ getGamepads: () => pads }));

    input.update(10);
    expect(input.readButton("confirm")).toMatchObject({
      isPressed: true,
      justPressed: true,
      value: 1
    });

    pads = [gamepad({ buttons: [{ pressed: false, value: 0 }], axes: [0, 0] })];
    input.update(20);
    expect(input.readButton("confirm")).toMatchObject({
      isPressed: false,
      justReleased: true,
      value: 0
    });
  });

  it("polls a basic left stick axis fixture", () => {
    const input = createInputFlow({ maps: [map] });
    input.addSource(
      createGamepadSource({
        getGamepads: () => [gamepad({ buttons: [], axes: [0.25, -0.75] })]
      })
    );

    input.update(10);

    expect(input.readAxis2D("move")).toMatchObject({
      value: { x: 0.25, y: -0.75 },
      magnitude: Math.hypot(0.25, -0.75)
    });
  });

  it("resets controls when the gamepad disappears", () => {
    let pads: readonly (BrowserGamepadLike | null)[] = [
      gamepad({ buttons: [{ pressed: true, value: 1 }], axes: [1, 0] })
    ];
    const input = createInputFlow({ maps: [map] });
    input.addSource(createGamepadSource({ getGamepads: () => pads }));

    input.update(10);
    pads = [null];
    input.update(20);

    expect(input.readButton("confirm")).toMatchObject({
      isPressed: false,
      justReleased: true
    });
    expect(input.readAxis2D("move").value).toEqual({ x: 0, y: 0 });
  });
});
