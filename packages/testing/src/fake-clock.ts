export class FakeClock {
  #timeMs: number;

  constructor(startMs = 0) {
    this.#timeMs = startMs;
  }

  now(): number {
    return this.#timeMs;
  }

  set(timeMs: number): void {
    if (!Number.isFinite(timeMs) || timeMs < 0) {
      throw new Error(`Clock time must be a non-negative finite number: ${timeMs}`);
    }
    this.#timeMs = timeMs;
  }

  advance(deltaMs: number): number {
    if (!Number.isFinite(deltaMs) || deltaMs < 0) {
      throw new Error(`Clock delta must be a non-negative finite number: ${deltaMs}`);
    }
    this.#timeMs += deltaMs;
    return this.#timeMs;
  }
}
