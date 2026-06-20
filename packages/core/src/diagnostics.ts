import type { ActionId, ContextId, ControlPath } from "./ids.js";

export type DiagnosticSeverity = "error" | "warning" | "info";

export type InputDiagnosticCode =
  | "CONTROL_CONSUMED"
  | "CONTEXT_EXCLUSIVE_BLOCK"
  | "ACTION_CONFLICT"
  | "BINDING_CONFLICT"
  | "INVALID_CONTROL_PATH"
  | "INVALID_OVERRIDE"
  | "UNRESOLVED_ACTION";

export interface InputDiagnostic {
  readonly severity: DiagnosticSeverity;
  readonly code: InputDiagnosticCode;
  readonly message: string;
  readonly mapId?: string;
  readonly bindingId?: string;
  readonly actionId?: ActionId;
  readonly contextId?: ContextId;
  readonly control?: ControlPath;
  readonly path?: string;
  readonly overrideIndex?: number;
}
