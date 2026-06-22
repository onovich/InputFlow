import { expect, test, type Page } from "@playwright/test";
import { installInputFlowPageRoutes } from "./inputflow-page.js";

interface BrowserPointerSmoke {
  readonly read: (timeMs?: number) => PointerSmokeState;
  readonly disconnect: (timeMs?: number) => PointerSmokeState;
  readonly dispatchCancel: () => void;
}

interface PointerSmokeState {
  readonly isPressed: boolean;
  readonly justPressed: boolean;
  readonly justReleased: boolean;
  readonly sourceControl?: string;
  readonly value: number;
}

declare global {
  interface Window {
    readonly inputFlowPointerSmoke?: BrowserPointerSmoke;
    inputFlowPointerNow?: number;
  }
}

test("maps pointer primary button to a button action in a real browser page", async ({ page }) => {
  await openPointerSmokePage(page);
  await pointerDownOnTarget(page);

  const pressed = await readPointerSmoke(page, 10);
  expect(pressed).toMatchObject({
    isPressed: true,
    justPressed: true,
    sourceControl: "<Pointer>/button/primary",
    value: 1
  });
  expect(Object.keys(pressed).sort()).toEqual([
    "actionId",
    "heldMs",
    "isPressed",
    "justPressed",
    "justReleased",
    "lastChangedAt",
    "sourceControl",
    "value"
  ]);

  await page.mouse.up();

  const released = await readPointerSmoke(page, 20);
  expect(released).toMatchObject({
    isPressed: false,
    justPressed: false,
    justReleased: true,
    value: 0
  });
});

test("releases pointer primary on pointercancel", async ({ page }) => {
  await openPointerSmokePage(page);
  await pointerDownOnTarget(page);
  expect(await readPointerSmoke(page, 30)).toMatchObject({
    isPressed: true,
    justPressed: true
  });

  await page.evaluate(() => {
    window.inputFlowPointerSmoke?.dispatchCancel();
  });

  expect(await readPointerSmoke(page, 40)).toMatchObject({
    isPressed: false,
    justReleased: true
  });
});

test("disconnect releases held pointer state and removes listeners", async ({ page }) => {
  await openPointerSmokePage(page);
  await pointerDownOnTarget(page);
  expect(await readPointerSmoke(page, 50)).toMatchObject({
    isPressed: true,
    justPressed: true
  });

  const disconnected = await page.evaluate(() => {
    if (!window.inputFlowPointerSmoke) {
      throw new Error("InputFlow pointer smoke harness is not ready");
    }
    return window.inputFlowPointerSmoke.disconnect(60);
  });
  expect(disconnected).toMatchObject({
    isPressed: false,
    justReleased: true
  });

  await page.mouse.up();
  await pointerDownOnTarget(page);

  expect(await readPointerSmoke(page, 70)).toMatchObject({
    isPressed: false,
    justPressed: false,
    justReleased: false,
    value: 0
  });
});

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

const readPointerSmoke = (page: Page, timeMs: number) =>
  page.evaluate((time) => {
    if (!window.inputFlowPointerSmoke) {
      throw new Error("InputFlow pointer smoke harness is not ready");
    }
    return window.inputFlowPointerSmoke.read(time);
  }, timeMs);
