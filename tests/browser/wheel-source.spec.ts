import { expect, test, type Page } from "@playwright/test";
import { installInputFlowPageRoutes } from "./inputflow-page.js";

interface BrowserPointerSmoke {
  readonly readWheel: (timeMs?: number) => WheelSmokeState;
}

interface WheelSmokeState {
  readonly changed: boolean;
  readonly delta: { readonly x: number; readonly y: number };
  readonly magnitude: number;
  readonly value: { readonly x: number; readonly y: number };
}

declare global {
  interface Window {
    readonly inputFlowPointerSmoke?: BrowserPointerSmoke;
  }
}

test("accumulates wheel delta for one browser frame and resets on the next frame", async ({
  page
}) => {
  await openPointerSmokePage(page);
  await moveOverTarget(page);

  expect(await readWheelSmoke(page, 0)).toMatchObject({
    changed: false,
    value: { x: 0, y: 0 },
    delta: { x: 0, y: 0 },
    magnitude: 0
  });

  await page.mouse.wheel(1, -2);
  await page.mouse.wheel(3, 1);

  expect(await readWheelSmoke(page, 16)).toMatchObject({
    changed: true,
    value: { x: 4, y: -1 },
    delta: { x: 4, y: -1 },
    magnitude: Math.hypot(4, -1)
  });

  expect(await readWheelSmoke(page, 32)).toMatchObject({
    changed: true,
    value: { x: 0, y: 0 },
    delta: { x: -4, y: 1 },
    magnitude: 0
  });

  expect(await readWheelSmoke(page, 48)).toMatchObject({
    changed: false,
    value: { x: 0, y: 0 },
    delta: { x: 0, y: 0 },
    magnitude: 0
  });
});

const openPointerSmokePage = async (page: Page): Promise<void> => {
  await installInputFlowPageRoutes(page);
  await page.goto("http://inputflow.local/pointer-smoke.html");
  await page.waitForFunction(() => document.body.dataset.inputflowReady === "true");
};

const moveOverTarget = async (page: Page): Promise<void> => {
  const box = await page.locator("#target").boundingBox();
  if (!box) {
    throw new Error("Pointer smoke target has no bounding box");
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
};

const readWheelSmoke = (page: Page, timeMs: number) =>
  page.evaluate((time) => {
    if (!window.inputFlowPointerSmoke) {
      throw new Error("InputFlow pointer smoke harness is not ready");
    }
    return window.inputFlowPointerSmoke.readWheel(time);
  }, timeMs);
