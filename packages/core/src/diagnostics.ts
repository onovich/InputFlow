import type { ContextId, ControlPath } from "./ids.js";

export type DiagnosticSeverity = "error" | "warning" | "info";

export type InputDiagnosticCode =
  | "CONTROL_CONSUMED"
  | "CONTEXT_EXCLUSIVE_BLOCK";

export interface InputDiagnostic {
  readonly severity: DiagnosticSeverity;
  readonly code: InputDiagnosticCode;
  readonly message: string;
  readonly contextId?: ContextId;
  readonly control?: ControlPath;
}
