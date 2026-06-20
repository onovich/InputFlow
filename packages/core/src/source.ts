import type { SourceId } from "./ids.js";
import type { RawInputEvent, RawInputEventInit } from "./raw-event.js";

export interface RawInputSink {
  push(event: RawInputEventInit): RawInputEvent;
}

export interface InputSource {
  readonly id: SourceId;
  connect(sink: RawInputSink): void;
  disconnect(): void;
  sample?(timeMs: number): void;
}
