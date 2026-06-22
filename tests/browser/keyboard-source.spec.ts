import { expect, test, type Page } from "@playwright/test";
import { installInputFlowPageRoutes } from "./inputflow-page.js";

interface BrowserKeyboardSmoke {
  readonly read: (timeMs?: number) => {
    readonly isPressed: boolean;
    readonly justPressed: boolean;
    readonly justReleased: boolean;
    readonly sourceControl?: string;
    readonly value: number;
  };
  readonly dispose: () => void;
}

declare global {
  interface Window {
    readonly inputFlowKeyboardSmoke?: BrowserKeyboardSmoke;
  }
}

test("maps KeyboardEvent.code to a button action in a real browser page", async ({ page }) => {
  await installInputFlowPageRoutes(page);
  await page.goto("http://inputflow.local/keyboard-smoke.html");
  await page.waitForFunction(() => document.body.dataset.inputflowReady === "true");

  await page.locator("#target").focus();
  await page.keyboard.down("KeyE");

  const pressed = await readKeyboardSmoke(page, 10);
  expect(pressed).toMatchObject({
    isPressed: true,
    justPressed: true,
    sourceControl: "<Keyboard>/code/KeyE",
    value: 1
  });

  await page.evaluate(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        code: "KeyE",
        key: "e",
        repeat: true,
        bubbles: true
      })
    );
  });

  const repeated = await readKeyboardSmoke(page, 20);
  expect(repeated).toMatchObject({
    isPressed: true,
    justPressed: false,
    justReleased: false
  });

  await page.keyboard.up("KeyE");

  const released = await readKeyboardSmoke(page, 30);
  expect(released).toMatchObject({
    isPressed: false,
    justPressed: false,
    justReleased: true,
    value: 0
  });
});

const readKeyboardSmoke = (page: Page, timeMs: number) =>
  page.evaluate((time) => {
    if (!window.inputFlowKeyboardSmoke) {
      throw new Error("InputFlow keyboard smoke harness is not ready");
    }
    return window.inputFlowKeyboardSmoke.read(time);
  }, timeMs);
