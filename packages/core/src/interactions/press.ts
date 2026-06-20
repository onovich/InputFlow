import type { ButtonActionState } from "../action-state.js";
import type { ActionId, ControlPath } from "../ids.js";

export interface EvaluatePressOptions {
  readonly actionId: ActionId;
  readonly previous: ButtonActionState;
  readonly value: number;
  readonly timeMs: number;
  readonly pressPoint?: number;
  readonly releasePoint?: number;
  readonly sourceControl?: ControlPath;
}

export const evaluatePress = ({
  actionId,
  previous,
  value,
  timeMs,
  pressPoint = 0.5,
  releasePoint = 0.5,
  sourceControl
}: EvaluatePressOptions): ButtonActionState => {
  const wasPressed = previous.isPressed;
  const isPressed = wasPressed ? value >= releasePoint : value >= pressPoint;
  const justPressed = !wasPressed && isPressed;
  const justReleased = wasPressed && !isPressed;
  const lastChangedAt = justPressed || justReleased ? timeMs : previous.lastChangedAt;
  const heldMs = isPressed ? Math.max(0, timeMs - lastChangedAt) : 0;

  const state = {
    actionId,
    value,
    isPressed,
    justPressed,
    justReleased,
    heldMs,
    lastChangedAt
  };

  return sourceControl ? { ...state, sourceControl } : state;
};
