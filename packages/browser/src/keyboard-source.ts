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
  resolveDefaultVisibilityTarget,
  shouldIgnoreEditableTarget,
  type BrowserEventTargetLike,
  type BrowserVisibilityTargetLike
} from "./event-target.js";

export interface BrowserKeyboardSourceOptions {
  readonly sourceId?: string;
  readonly deviceId?: string;
  readonly target?: BrowserEventTargetLike;
  readonly blurTarget?: BrowserEventTargetLike;
  readonly visibilityTarget?: BrowserVisibilityTargetLike;
  readonly now?: () => number;
  readonly ignoreEditableTargets?: boolean;
}

export interface BrowserKeyboardSource extends InputSource {
  readonly id: SourceId;
}

export const createKeyboardSource = (
  options: BrowserKeyboardSourceOptions = {}
): BrowserKeyboardSource => {
  const sourceId = asSourceId(options.sourceId ?? "browser.keyboard");
  const deviceId = asDeviceId(options.deviceId ?? "keyboard");
  const now = options.now ?? (() => 0);
  const ignoreEditableTargets = options.ignoreEditableTargets ?? true;
  const pressedCodes = new Set<string>();
  let sink: RawInputSink | undefined;
  let connected:
    | {
        readonly target: BrowserEventTargetLike;
        readonly blurTarget: BrowserEventTargetLike;
        readonly visibilityTarget?: BrowserVisibilityTargetLike;
      }
    | undefined;

  const pushKey = (code: string, value: number, timeMs: number): void => {
    sink?.push({
      sourceId,
      deviceId,
      control: createControlPath(`<Keyboard>/code/${code}`),
      value,
      timeMs
    });
  };

  const releaseAll = (timeMs: number): void => {
    for (const code of pressedCodes) {
      pushKey(code, 0, timeMs);
    }
    pressedCodes.clear();
  };

  const onKeyDown = (event: Event): void => {
    if (shouldIgnoreEditableTarget(event, ignoreEditableTargets)) {
      return;
    }

    const code = getKeyboardCode(event);
    if (!code) {
      return;
    }

    pressedCodes.add(code);
    pushKey(code, 1, getEventTime(event, now));
  };

  const onKeyUp = (event: Event): void => {
    if (shouldIgnoreEditableTarget(event, ignoreEditableTargets)) {
      return;
    }

    const code = getKeyboardCode(event);
    if (!code) {
      return;
    }

    pressedCodes.delete(code);
    pushKey(code, 0, getEventTime(event, now));
  };

  const onBlur = (event: Event): void => {
    releaseAll(getEventTime(event, now));
  };

  const onVisibilityChange = (event: Event): void => {
    if (connected?.visibilityTarget?.visibilityState === "hidden") {
      releaseAll(getEventTime(event, now));
    }
  };

  return {
    id: sourceId,

    connect(nextSink) {
      if (connected) {
        this.disconnect();
      }

      const target = options.target ?? resolveDefaultEventTarget();
      if (!target) {
        throw new Error("Keyboard source requires an event target");
      }

      const blurTarget = options.blurTarget ?? target;
      const visibilityTarget = options.visibilityTarget ?? resolveDefaultVisibilityTarget();

      sink = nextSink;
      connected = {
        target,
        blurTarget,
        ...(visibilityTarget ? { visibilityTarget } : {})
      };

      target.addEventListener("keydown", onKeyDown);
      target.addEventListener("keyup", onKeyUp);
      blurTarget.addEventListener("blur", onBlur);
      visibilityTarget?.addEventListener("visibilitychange", onVisibilityChange);
    },

    disconnect() {
      if (!connected) {
        return;
      }

      releaseAll(now());
      connected.target.removeEventListener("keydown", onKeyDown);
      connected.target.removeEventListener("keyup", onKeyUp);
      connected.blurTarget.removeEventListener("blur", onBlur);
      connected.visibilityTarget?.removeEventListener("visibilitychange", onVisibilityChange);
      connected = undefined;
      sink = undefined;
    }
  };
};

const getKeyboardCode = (event: Event): string | undefined => {
  const code = (event as { readonly code?: unknown }).code;
  return typeof code === "string" && code.length > 0 ? code : undefined;
};
