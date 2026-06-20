export interface RepeatInteractionState {
  readonly pressedAt?: number;
  readonly nextRepeatAt?: number;
}

export interface RepeatInteractionResult {
  readonly state: RepeatInteractionState;
  readonly performed: boolean;
}

export interface EvaluateRepeatOptions {
  readonly state: RepeatInteractionState;
  readonly value: number;
  readonly timeMs: number;
  readonly pressPoint?: number;
  readonly releasePoint?: number;
  readonly delayMs?: number;
  readonly intervalMs?: number;
}

export const evaluateRepeat = ({
  state,
  value,
  timeMs,
  pressPoint = 0.5,
  releasePoint = 0.5,
  delayMs = 300,
  intervalMs = 80
}: EvaluateRepeatOptions): RepeatInteractionResult => {
  if (state.pressedAt === undefined && value >= pressPoint) {
    return {
      state: { pressedAt: timeMs, nextRepeatAt: timeMs + delayMs },
      performed: true
    };
  }

  if (state.pressedAt !== undefined && value < releasePoint) {
    return { state: {}, performed: false };
  }

  if (
    state.pressedAt !== undefined &&
    state.nextRepeatAt !== undefined &&
    timeMs >= state.nextRepeatAt
  ) {
    const intervalsElapsed = Math.floor((timeMs - state.nextRepeatAt) / intervalMs);
    return {
      state: {
        pressedAt: state.pressedAt,
        nextRepeatAt: state.nextRepeatAt + (intervalsElapsed + 1) * intervalMs
      },
      performed: true
    };
  }

  return { state, performed: false };
};
