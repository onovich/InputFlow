import {
  asDeviceId,
  asSourceId,
  createControlPath,
  type ControlPath,
  type DeviceId,
  type InputSource,
  type RawInputSink,
  type RawInputValue,
  type SourceId
} from "@inputflow/core";

export interface VirtualInputSourceOptions {
  readonly id?: string;
  readonly deviceId?: string;
}

export class VirtualInputSource implements InputSource {
  readonly id: SourceId;
  readonly deviceId: DeviceId;
  #sink: RawInputSink | undefined;

  constructor(options: VirtualInputSourceOptions = {}) {
    this.id = asSourceId(options.id ?? "virtual");
    this.deviceId = asDeviceId(options.deviceId ?? "virtual-device");
  }

  connect(sink: RawInputSink): void {
    this.#sink = sink;
  }

  disconnect(): void {
    this.#sink = undefined;
  }

  setButton(control: string | ControlPath, pressed: boolean, timeMs: number): void {
    this.setControl(control, pressed ? 1 : 0, timeMs);
  }

  setControl(control: string | ControlPath, value: RawInputValue, timeMs: number): void {
    if (!this.#sink) {
      throw new Error("VirtualInputSource must be connected before events can be emitted");
    }

    this.#sink.push({
      sourceId: this.id,
      deviceId: this.deviceId,
      control: typeof control === "string" ? createControlPath(control) : control,
      value,
      timeMs
    });
  }
}
