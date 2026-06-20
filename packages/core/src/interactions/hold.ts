export interface HoldInteractionState {
  readonly pressedAt?: number;
  readonly performed: boolean;
}

export interface HoldInteractionResult {
  readonly state: HoldInteractionState;
  readonly performed: boolean;
}

export interface EvaluateHoldOptions {
  readonly state: HoldInteractionState;
  readonly value: number;
  readonly timeMs: number;
  readonly pressPoint?: number;
  readonly releasePoint?: number;
  readonly minDurationMs?: number;
}

export const initialHoldState: HoldInteractionState = { performed: false };

export const evaluateHold = ({
  state,
  value,
  timeMs,
  pressPoint = 0.5,
  releasePoint = 0.5,
  minDurationMs = 300
}: EvaluateHoldOptions): HoldInteractionResult => {
  if (state.pressedAt === undefined && value >= pressPoint) {
    return { state: { pressedAt: timeMs, performed: false }, performed: false };
  }

  if (state.pressedAt !== undefined && value < releasePoint) {
    return { state: initialHoldState, performed: false };
  }

  if (
    state.pressedAt !== undefined &&
    !state.performed &&
    timeMs - state.pressedAt >= minDurationMs
  ) {
    return {
      state: { pressedAt: state.pressedAt, performed: true },
      performed: true
    };
  }

  return { state, performed: false };
};
