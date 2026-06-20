import {
  assertFiniteTime,
  assertRawInputValue,
  type RawInputEvent,
  type RawInputEventInit
} from "./raw-event.js";

export class RawEventQueue {
  #events: RawInputEvent[] = [];
  #nextSequence = 0;

  get size(): number {
    return this.#events.length;
  }

  enqueue(event: RawInputEventInit): RawInputEvent {
    assertFiniteTime(event.timeMs);
    assertRawInputValue(event.value);

    const sequence = event.sequence ?? this.#nextSequence++;
    if (!Number.isInteger(sequence) || sequence < 0) {
      throw new Error(`Raw input event sequence must be a non-negative integer: ${sequence}`);
    }

    if (sequence >= this.#nextSequence) {
      this.#nextSequence = sequence + 1;
    }

    const queued: RawInputEvent = { ...event, sequence };
    this.#events.push(queued);
    return queued;
  }

  drainSorted(): RawInputEvent[] {
    const drained = this.#events
      .slice()
      .sort((left, right) => left.timeMs - right.timeMs || left.sequence - right.sequence);

    this.#events = [];
    return drained;
  }

  clear(): void {
    this.#events = [];
  }
}
