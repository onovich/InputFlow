import { expect, test, type Page } from "@playwright/test";
import { installInputFlowPageRoutes } from "./inputflow-page.js";

interface ButtonSmokeState {
  readonly isPressed: boolean;
  readonly justPressed: boolean;
  readonly justReleased: boolean;
  readonly value: number;
}

declare global {
  interface Window {
    readonly inputFlowKeyboardSmoke?: {
      readonly read: (timeMs?: number) => ButtonSmokeState;
    };
    readonly inputFlowPointerSmoke?: {
      readonly read: (timeMs?: number) => ButtonSmokeState;
    };
  }
}

test("releases held keyboard state on browser blur", async ({ page }) => {
  await openKeyboardSmokePage(page);
  await page.locator("#target").focus();
  await page.keyboard.down("KeyE");
  expect(await readKeyboardSmoke(page, 10)).toMatchObject({
    isPressed: true,
    justPressed: true
  });

  await page.evaluate(() => {
    window.dispatchEvent(new Event("blur"));
  });

  expect(await readKeyboardSmoke(page, 20)).toMatchObject({
    isPressed: false,
    justReleased: true,
    value: 0
  });
});

test("releases held keyboard state on hidden visibilitychange", async ({ page }) => {
  await openKeyboardSmokePage(page);
  await page.locator("#target").focus();
  await page.keyboard.down("KeyE");
  expect(await readKeyboardSmoke(page, 30)).toMatchObject({
    isPressed: true,
    justPressed: true
  });

  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden"
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  expect(await readKeyboardSmoke(page, 40)).toMatchObject({
    isPressed: false,
    justReleased: true,
    value: 0
  });
});

test("releases held pointer state on browser blur", async ({ page }) => {
  await openPointerSmokePage(page);
  await pointerDownOnTarget(page);
  expect(await readPointerSmoke(page, 50)).toMatchObject({
    isPressed: true,
    justPressed: true
  });

  await page.evaluate(() => {
    window.dispatchEvent(new Event("blur"));
  });

  expect(await readPointerSmoke(page, 60)).toMatchObject({
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

const openPointerSmokePage = async (page: Page): Promise<void> => {
  await installInputFlowPageRoutes(page);
  await page.goto("http://inputflow.local/pointer-smoke.html");
  await page.waitForFunction(() => document.body.dataset.inputflowReady === "true");
};

const pointerDownOnTarget = async (page: Page): Promise<void> => {
  const box = await page.locator("#target").boundingBox();
  if (!box) {
    throw new Error("Pointer smoke target has no bounding box");
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
};

const readKeyboardSmoke = (page: Page, timeMs: number) =>
  page.evaluate((time) => {
    if (!window.inputFlowKeyboardSmoke) {
      throw new Error("InputFlow keyboard smoke harness is not ready");
    }
    return window.inputFlowKeyboardSmoke.read(time);
  }, timeMs);

const readPointerSmoke = (page: Page, timeMs: number) =>
  page.evaluate((time) => {
    if (!window.inputFlowPointerSmoke) {
      throw new Error("InputFlow pointer smoke harness is not ready");
    }
    return window.inputFlowPointerSmoke.read(time);
  }, timeMs);
