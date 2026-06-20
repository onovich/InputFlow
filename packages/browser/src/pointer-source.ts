import {
  asDeviceId,
  asSourceId,
  createControlPath,
  type DeviceId,
  type InputSource,
  type RawInputSink,
  type SourceId
} from "@inputflow/core";
import {
  getEventTime,
  resolveDefaultEventTarget,
  shouldIgnoreEditableTarget,
  type BrowserEventTargetLike
} from "./event-target.js";

export interface BrowserPointerSourceOptions {
  readonly sourceId?: string;
  readonly deviceId?: string;
  readonly target?: BrowserEventTargetLike;
  readonly blurTarget?: BrowserEventTargetLike;
  readonly now?: () => number;
  readonly ignoreEditableTargets?: boolean;
}

export interface BrowserPointerSource extends InputSource {
  readonly id: SourceId;
}

export const createPointerSource = (
  options: BrowserPointerSourceOptions = {}
): BrowserPointerSource => {
  const sourceId = asSourceId(options.sourceId ?? "browser.pointer");
  const deviceId = asDeviceId(options.deviceId ?? "pointer");
  const now = options.now ?? (() => 0);
  const ignoreEditableTargets = options.ignoreEditableTargets ?? true;
  const pressedButtons = new Set<string>();
  let sink: RawInputSink | undefined;
  let connected:
    | {
        readonly target: BrowserEventTargetLike;
        readonly blurTarget: BrowserEventTargetLike;
      }
    | undefined;
  let pendingWheel = { x: 0, y: 0 };
  let wheelActive = false;

  const pushButton = (button: string, value: number, timeMs: number): void => {
    sink?.push({
      sourceId,
      deviceId,
      control: createControlPath(`<Pointer>/button/${button}`),
      value,
      timeMs
    });
  };

  const pushWheel = (value: { readonly x: number; readonly y: number }, timeMs: number): void => {
    sink?.push({
      sourceId,
      deviceId,
      control: createControlPath("<Pointer>/wheel/main"),
      value,
      timeMs
    });
  };

  const releaseAll = (timeMs: number): void => {
    for (const button of pressedButtons) {
      pushButton(button, 0, timeMs);
    }
    pressedButtons.clear();
  };

  const onPointerDown = (event: Event): void => {
    if (shouldIgnoreEditableTarget(event, ignoreEditableTargets)) {
      return;
    }

    const button = getPointerButtonName(event);
    if (!button) {
      return;
    }

    pressedButtons.add(button);
    pushButton(button, 1, getEventTime(event, now));
  };

  const onPointerUp = (event: Event): void => {
    if (shouldIgnoreEditableTarget(event, ignoreEditableTargets)) {
      return;
    }

    const button = getPointerButtonName(event);
    if (!button) {
      return;
    }

    pressedButtons.delete(button);
    pushButton(button, 0, getEventTime(event, now));
  };

  const onWheel = (event: Event): void => {
    if (shouldIgnoreEditableTarget(event, ignoreEditableTargets)) {
      return;
    }

    const delta = getWheelDelta(event);
    pendingWheel = {
      x: pendingWheel.x + delta.x,
      y: pendingWheel.y + delta.y
    };
  };

  const onBlur = (event: Event): void => {
    releaseAll(getEventTime(event, now));
  };

  return {
    id: sourceId,

    connect(nextSink) {
      if (connected) {
        this.disconnect();
      }

      const target = options.target ?? resolveDefaultEventTarget();
      if (!target) {
        throw new Error("Pointer source requires an event target");
      }

      const blurTarget = options.blurTarget ?? target;
      sink = nextSink;
      connected = { target, blurTarget };

      target.addEventListener("pointerdown", onPointerDown);
      target.addEventListener("pointerup", onPointerUp);
      target.addEventListener("pointercancel", onPointerUp);
      target.addEventListener("wheel", onWheel);
      blurTarget.addEventListener("blur", onBlur);
    },

    disconnect() {
      if (!connected) {
        return;
      }

      releaseAll(now());
      connected.target.removeEventListener("pointerdown", onPointerDown);
      connected.target.removeEventListener("pointerup", onPointerUp);
      connected.target.removeEventListener("pointercancel", onPointerUp);
      connected.target.removeEventListener("wheel", onWheel);
      connected.blurTarget.removeEventListener("blur", onBlur);
      connected = undefined;
      sink = undefined;
      pendingWheel = { x: 0, y: 0 };
      wheelActive = false;
    },

    sample(timeMs) {
      if (pendingWheel.x !== 0 || pendingWheel.y !== 0) {
        pushWheel(pendingWheel, timeMs);
        pendingWheel = { x: 0, y: 0 };
        wheelActive = true;
        return;
      }

      if (wheelActive) {
        pushWheel({ x: 0, y: 0 }, timeMs);
        wheelActive = false;
      }
    }
  };
};

const getPointerButtonName = (event: Event): string | undefined => {
  const button = (event as { readonly button?: unknown }).button;
  if (button === 0) {
    return "primary";
  }
  if (button === 1) {
    return "middle";
  }
  if (button === 2) {
    return "secondary";
  }
  return undefined;
};

const getWheelDelta = (event: Event): { readonly x: number; readonly y: number } => {
  const wheel = event as { readonly deltaX?: unknown; readonly deltaY?: unknown };
  return {
    x: typeof wheel.deltaX === "number" && Number.isFinite(wheel.deltaX) ? wheel.deltaX : 0,
    y: typeof wheel.deltaY === "number" && Number.isFinite(wheel.deltaY) ? wheel.deltaY : 0
  };
};
