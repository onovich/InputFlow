import {
  asDeviceId,
  asSourceId,
  createControlPath,
  type DeviceId,
  type InputSource,
  type RawInputSink,
  type SourceId,
  type Vector2Value
} from "@inputflow/core";

export interface BrowserGamepadButtonLike {
  readonly pressed?: boolean;
  readonly value?: number;
}

export interface BrowserGamepadLike {
  readonly connected?: boolean;
  readonly buttons: readonly BrowserGamepadButtonLike[];
  readonly axes: readonly number[];
}

export interface BrowserGamepadSourceOptions {
  readonly sourceId?: string;
  readonly deviceId?: string;
  readonly index?: number;
  readonly getGamepads?: () => readonly (BrowserGamepadLike | null | undefined)[];
}

export interface BrowserGamepadSource extends InputSource {
  readonly id: SourceId;
}

export const createGamepadSource = (
  options: BrowserGamepadSourceOptions = {}
): BrowserGamepadSource => {
  const sourceId = asSourceId(options.sourceId ?? "browser.gamepad");
  const deviceId = asDeviceId(options.deviceId ?? "gamepad");
  const index = options.index ?? 0;
  const getGamepads = options.getGamepads ?? resolveDefaultGamepads;
  let sink: RawInputSink | undefined;

  const push = (control: string, value: number | Vector2Value, timeMs: number): void => {
    sink?.push({
      sourceId,
      deviceId,
      control: createControlPath(control),
      value,
      timeMs
    });
  };

  return {
    id: sourceId,

    connect(nextSink) {
      sink = nextSink;
    },

    disconnect() {
      sink = undefined;
    },

    sample(timeMs) {
      const gamepad = getGamepads()[index];
      const connected = gamepad && gamepad.connected !== false;
      const south = connected ? readButtonValue(gamepad.buttons[0]) : 0;
      const leftStick = connected ? readLeftStick(gamepad.axes) : { x: 0, y: 0 };

      push("<Gamepad>/button/south", south, timeMs);
      push("<Gamepad>/stick/left", leftStick, timeMs);
    }
  };
};

const resolveDefaultGamepads = (): readonly (BrowserGamepadLike | null | undefined)[] => {
  const getGamepads = (globalThis as {
    readonly navigator?: { readonly getGamepads?: unknown };
  }).navigator?.getGamepads;

  if (typeof getGamepads !== "function") {
    return [];
  }

  return getGamepads.call((globalThis as { readonly navigator?: unknown }).navigator) as readonly (
    | BrowserGamepadLike
    | null
    | undefined
  )[];
};

const readButtonValue = (button: BrowserGamepadButtonLike | undefined): number => {
  if (!button) {
    return 0;
  }

  if (typeof button.value === "number" && Number.isFinite(button.value)) {
    return button.value;
  }

  return button.pressed === true ? 1 : 0;
};

const readLeftStick = (axes: readonly number[]): Vector2Value => ({
  x: readAxis(axes[0]),
  y: readAxis(axes[1])
});

const readAxis = (value: number | undefined): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;
