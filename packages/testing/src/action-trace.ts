import type { ButtonActionState } from "@inputflow/core";

export interface ButtonActionTraceState {
  readonly value: number;
  readonly isPressed: boolean;
  readonly justPressed: boolean;
  readonly justReleased: boolean;
  readonly heldMs: number;
  readonly sourceControl?: string;
}

export interface ActionSnapshotTraceFrame {
  readonly t: number;
  readonly buttons: Record<string, ButtonActionTraceState>;
}

export interface ActionSnapshotTrace {
  readonly schemaVersion: 1;
  readonly kind: "action-snapshot-trace";
  readonly frames: readonly ActionSnapshotTraceFrame[];
}

export const toButtonTraceState = (state: ButtonActionState): ButtonActionTraceState => {
  const traceState = {
    value: state.value,
    isPressed: state.isPressed,
    justPressed: state.justPressed,
    justReleased: state.justReleased,
    heldMs: state.heldMs
  };

  return state.sourceControl ? { ...traceState, sourceControl: state.sourceControl } : traceState;
};
