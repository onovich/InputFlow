import { expect, test, type Page } from "@playwright/test";
import { installInputFlowPageRoutes } from "./inputflow-page.js";

interface BrowserKeyboardSmoke {
  readonly read: (timeMs?: number) => {
    readonly isPressed: boolean;
    readonly justPressed: boolean;
    readonly justReleased: boolean;
    readonly value: number;
  };
}

declare global {
  interface Window {
    readonly inputFlowKeyboardSmoke?: BrowserKeyboardSmoke;
  }
}

const editableTargets = [
  "#text-input",
  "#text-area",
  "#select-field",
  "#editable-region"
] as const;

test("filters gameplay keyboard shortcuts from editable targets", async ({ page }) => {
  await openKeyboardSmokePage(page);

  for (const [index, selector] of editableTargets.entries()) {
    await page.locator(selector).focus();
    await page.keyboard.down("KeyE");

    expect(await readKeyboardSmoke(page, 10 + index * 10)).toMatchObject({
      isPressed: false,
      justPressed: false,
      justReleased: false,
      value: 0
    });

    await page.keyboard.up("KeyE");
    expect(await readKeyboardSmoke(page, 11 + index * 10)).toMatchObject({
      isPressed: false,
      justPressed: false,
      justReleased: false,
      value: 0
    });
  }
});

test("allows gameplay keyboard shortcuts from non-editable targets", async ({ page }) => {
  await openKeyboardSmokePage(page);

  await page.locator("#target").focus();
  await page.keyboard.down("KeyE");
  expect(await readKeyboardSmoke(page, 60)).toMatchObject({
    isPressed: true,
    justPressed: true,
    value: 1
  });

  await page.keyboard.up("KeyE");
  expect(await readKeyboardSmoke(page, 70)).toMatchObject({
    isPressed: false,
    justReleased: true,
    value: 0
  });
});

const openKeyboardSmokePage = async (page: Page): Promise<void> => {
  await installInputFlowPageRoutes(page);
  await page.goto("http://inputflow.local/keyboard-smoke.html");
  await page.waitForFunction(() => document.body.dataset.inputflowReady === "true");
};

const readKeyboardSmoke = (page: Page, timeMs: number) =>
  page.evaluate((time) => {
    if (!window.inputFlowKeyboardSmoke) {
      throw new Error("InputFlow keyboard smoke harness is not ready");
    }
    return window.inputFlowKeyboardSmoke.read(time);
  }, timeMs);
