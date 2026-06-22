import { expect, test, type Page } from "@playwright/test";
import { installInputFlowPageRoutes } from "./inputflow-page.js";

interface LifecycleEvent {
  readonly control: string;
  readonly timeMs: number;
  readonly value: number | { readonly x: number; readonly y: number };
}

interface LifecycleSmoke {
  readonly clear: () => void;
  readonly connect: () => void;
  readonly disconnect: (timeMs?: number) => void;
  readonly events: () => readonly LifecycleEvent[];
  readonly setTime: (timeMs: number) => void;
}

declare global {
  interface Window {
    readonly inputFlowLifecycleSmoke?: LifecycleSmoke;
  }
}

test("repeated connect does not duplicate pointer listeners", async ({ page }) => {
  await openLifecycleSmokePage(page);
  await page.evaluate(() => {
    window.inputFlowLifecycleSmoke?.connect();
    window.inputFlowLifecycleSmoke?.connect();
    window.inputFlowLifecycleSmoke?.setTime(10);
  });

  await pointerDownOnTarget(page);

  const events = await lifecycleEvents(page);
  expect(events).toHaveLength(1);
  expect(events[0]).toMatchObject({
    control: "<Pointer>/button/primary",
    value: 1
  });
  expect(events[0]?.timeMs).toEqual(expect.any(Number));
});

test("disconnect removes pointer listeners", async ({ page }) => {
  await openLifecycleSmokePage(page);
  await page.evaluate(() => {
    window.inputFlowLifecycleSmoke?.connect();
    window.inputFlowLifecycleSmoke?.disconnect(20);
    window.inputFlowLifecycleSmoke?.clear();
    window.inputFlowLifecycleSmoke?.setTime(30);
  });

  await pointerDownOnTarget(page);

  expect(await lifecycleEvents(page)).toEqual([]);
});

test("disconnect releases held pointer state and allows reconnect", async ({ page }) => {
  await openLifecycleSmokePage(page);
  await page.evaluate(() => {
    window.inputFlowLifecycleSmoke?.connect();
    window.inputFlowLifecycleSmoke?.setTime(40);
  });

  await pointerDownOnTarget(page);
  await page.evaluate(() => {
    window.inputFlowLifecycleSmoke?.disconnect(50);
  });

  const disconnectEvents = await lifecycleEvents(page);
  expect(disconnectEvents).toHaveLength(2);
  expect(disconnectEvents[0]).toMatchObject({
    control: "<Pointer>/button/primary",
    value: 1
  });
  expect(disconnectEvents[0]?.timeMs).toEqual(expect.any(Number));
  expect(disconnectEvents[1]).toEqual({
    control: "<Pointer>/button/primary",
    value: 0,
    timeMs: 50
  });

  await page.mouse.up();
  await page.evaluate(() => {
    window.inputFlowLifecycleSmoke?.clear();
    window.inputFlowLifecycleSmoke?.connect();
    window.inputFlowLifecycleSmoke?.setTime(60);
  });
  await pointerDownOnTarget(page);

  const reconnectEvents = await lifecycleEvents(page);
  expect(reconnectEvents).toHaveLength(1);
  expect(reconnectEvents[0]).toMatchObject({
    control: "<Pointer>/button/primary",
    value: 1
  });
  expect(reconnectEvents[0]?.timeMs).toEqual(expect.any(Number));
});

const openLifecycleSmokePage = async (page: Page): Promise<void> => {
  await installInputFlowPageRoutes(page);
  await page.goto("http://inputflow.local/lifecycle-smoke.html");
  await page.waitForFunction(() => document.body.dataset.inputflowReady === "true");
};

const pointerDownOnTarget = async (page: Page): Promise<void> => {
  const box = await page.locator("#target").boundingBox();
  if (!box) {
    throw new Error("Lifecycle smoke target has no bounding box");
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
};

const lifecycleEvents = (page: Page) =>
  page.evaluate(() => {
    if (!window.inputFlowLifecycleSmoke) {
      throw new Error("InputFlow lifecycle smoke harness is not ready");
    }
    return window.inputFlowLifecycleSmoke.events();
  });
