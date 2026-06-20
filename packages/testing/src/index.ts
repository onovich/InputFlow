export {
  assertActionSnapshotTrace,
  compareActionSnapshotTrace,
  toButtonTraceState,
  type ActionSnapshotTrace,
  type ActionSnapshotTraceComparison,
  type ActionSnapshotTraceFrame,
  type ActionSnapshotTraceMismatch,
  type ButtonActionTraceState
} from "./action-trace.js";
export { FakeClock } from "./fake-clock.js";
export {
  runReplayTrace,
  type ReplayRunnerOptions,
  type ReplayTrace,
  type ReplayTraceEvent
} from "./replay-runner.js";
export { VirtualInputSource, type VirtualInputSourceOptions } from "./virtual-input-source.js";
