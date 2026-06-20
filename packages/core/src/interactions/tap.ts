export interface TapInteractionState {
  readonly pressedAt?: number;
}

export interface TapInteractionResult {
  readonly state: TapInteractionState;
  readonly performed: boolean;
}

export interface EvaluateTapOptions {
  readonly state: TapInteractionState;
  readonly value: number;
  readonly timeMs: number;
  readonly pressPoint?: number;
  readonly releasePoint?: number;
  readonly maxDurationMs?: number;
}

export const evaluateTap = ({
  state,
  value,
  timeMs,
  pressPoint = 0.5,
  releasePoint = 0.5,
  maxDurationMs = 200
}: EvaluateTapOptions): TapInteractionResult => {
  if (state.pressedAt === undefined && value >= pressPoint) {
    return { state: { pressedAt: timeMs }, performed: false };
  }

  if (state.pressedAt !== undefined && value < releasePoint) {
    return {
      state: {},
      performed: timeMs - state.pressedAt <= maxDurationMs
    };
  }

  return { state, performed: false };
};
