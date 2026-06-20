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

export interface ActionSnapshotTraceMismatch {
  readonly path: string;
  readonly expected: unknown;
  readonly actual: unknown;
}

export interface ActionSnapshotTraceComparison {
  readonly pass: boolean;
  readonly mismatches: readonly ActionSnapshotTraceMismatch[];
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

export const compareActionSnapshotTrace = (
  actual: ActionSnapshotTrace,
  expected: ActionSnapshotTrace
): ActionSnapshotTraceComparison => {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson === expectedJson) {
    return { pass: true, mismatches: [] };
  }

  return {
    pass: false,
    mismatches: [
      {
        path: "$",
        expected,
        actual
      }
    ]
  };
};

export const assertActionSnapshotTrace = (
  actual: ActionSnapshotTrace,
  expected: ActionSnapshotTrace
): void => {
  const comparison = compareActionSnapshotTrace(actual, expected);
  if (!comparison.pass) {
    const details = comparison.mismatches
      .map((mismatch) => `${mismatch.path}: expected ${JSON.stringify(mismatch.expected)} but got ${JSON.stringify(mismatch.actual)}`)
      .join("\n");
    throw new Error(`Action snapshot trace mismatch:\n${details}`);
  }
};
