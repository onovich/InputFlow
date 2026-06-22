import { expect, test, type Page } from "@playwright/test";
import { installInputFlowPageRoutes } from "./inputflow-page.js";

interface BrowserGamepadSmoke {
  readonly read: (timeMs?: number) => {
    readonly confirm: {
      readonly isPressed: boolean;
      readonly justPressed: boolean;
      readonly justReleased: boolean;
      readonly value: number;
    };
    readonly move: {
      readonly changed: boolean;
      readonly magnitude: number;
      readonly value: { readonly x: number; readonly y: number };
    };
  };
  readonly setPads: (pads: readonly unknown[]) => void;
}

declare global {
  interface Window {
    readonly inputFlowGamepadSmoke?: BrowserGamepadSmoke;
  }
}

test("polls a browser-level gamepad fixture for south button and left stick", async ({
  page
}) => {
  await openGamepadSmokePage(page);
  await page.evaluate(() => {
    window.inputFlowGamepadSmoke?.setPads([
      {
        connected: true,
        buttons: [{ pressed: true, value: 1 }],
        axes: [0.5, -0.25]
      }
    ]);
  });

  const active = await readGamepadSmoke(page, 10);
  expect(active.confirm).toMatchObject({
    isPressed: true,
    justPressed: true,
    value: 1
  });
  expect(active.move).toMatchObject({
    changed: true,
    value: { x: 0.5, y: -0.25 },
    magnitude: Math.hypot(0.5, -0.25)
  });

  await page.evaluate(() => {
    window.inputFlowGamepadSmoke?.setPads([null]);
  });

  const disconnected = await readGamepadSmoke(page, 20);
  expect(disconnected.confirm).toMatchObject({
    isPressed: false,
    justReleased: true,
    value: 0
  });
  expect(disconnected.move).toMatchObject({
    changed: true,
    value: { x: 0, y: 0 },
    magnitude: 0
  });
});

const openGamepadSmokePage = async (page: Page): Promise<void> => {
  await installInputFlowPageRoutes(page);
  await page.goto("http://inputflow.local/gamepad-smoke.html");
  await page.waitForFunction(() => document.body.dataset.inputflowReady === "true");
};

const readGamepadSmoke = (page: Page, timeMs: number) =>
  page.evaluate((time) => {
    if (!window.inputFlowGamepadSmoke) {
      throw new Error("InputFlow gamepad smoke harness is not ready");
    }
    return window.inputFlowGamepadSmoke.read(time);
  }, timeMs);
