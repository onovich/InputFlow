# InputFlow Sinan Diagnostics Handoff

Date: 2026-06-22
Status: Phase 11 handoff asset
Scope: InputFlow-side diagnostics contract for a future Sinan adapter POC

## Purpose

This document explains which diagnostics InputFlow can produce for the Sinan adapter POC handoff, how those diagnostics should be preserved in downstream evidence, and which decisions remain owned by the Sinan repository.

It does not define Sinan UI presentation, final action namespaces, context priority policy, EngineMode, World, EventSystem, Three picking, or an `@inputflow/sinan` package.

## InputFlow Diagnostic Shape

InputFlow diagnostics are represented by `InputDiagnostic` in `packages/core/src/diagnostics.ts`.

Stable machine-readable fields:

```txt
severity: "error" | "warning" | "info"
code: InputDiagnosticCode
message: string
mapId?: string
bindingId?: string
actionId?: string
contextId?: string
control?: string
path?: string
overrideIndex?: number
```

Current diagnostic codes:

```txt
CONTROL_CONSUMED
CONTEXT_EXCLUSIVE_BLOCK
ACTION_CONFLICT
BINDING_CONFLICT
INVALID_CONTROL_PATH
INVALID_OVERRIDE
UNRESOLVED_ACTION
```

Sinan-side tooling should treat `code` and the optional ids as the durable matching surface. `message` is useful for logs and reports, but it should not be parsed as a stable protocol.

## Compile-Time Diagnostics

Compile-time diagnostics are produced while building or transforming input maps and overrides. They are useful for adapter boot diagnostics, CI contract checks, and user-authored binding validation.

Expected downstream handling:

- Capture `severity`, `code`, `mapId`, `bindingId`, `actionId`, `control`, `path`, and `overrideIndex` when present.
- Include the InputFlow package version or source commit used by the adapter run.
- Include the adapter commit from the Sinan repository.
- Keep the original map or override fixture id in the evidence packet.
- Treat `error` diagnostics as contract failures unless the downstream checklist explicitly marks the scenario as negative coverage.
- Treat `warning` diagnostics as non-fatal only when the adapter has documented why degraded behavior is acceptable.

Covered InputFlow cases:

- `UNRESOLVED_ACTION`: a binding points at an action id not declared by the map.
- `BINDING_CONFLICT`: duplicate binding ids or conflicting override targets.
- `INVALID_CONTROL_PATH`: map controls do not match the InputFlow control-path grammar.
- `INVALID_OVERRIDE`: an override cannot be applied cleanly.

## Runtime Diagnostics

Runtime diagnostics are exposed through `input.debugSnapshot().diagnostics` and are intended for reproducible replay/debug evidence rather than permanent gameplay semantics.

Expected downstream handling:

- Capture diagnostics immediately after the frame being asserted.
- Pair each diagnostic snapshot with the replay trace name, active context ids, and pressed controls.
- Preserve `CONTROL_CONSUMED` records for modal or pause isolation cases.
- Preserve `CONTEXT_EXCLUSIVE_BLOCK` records for exclusive context routing cases.
- Do not infer Sinan UI focus, modal title, scene state, world target, or entity id from InputFlow diagnostics alone.

Covered InputFlow cases:

- `CONTROL_CONSUMED`: a higher-priority matched context consumed a control before lower-priority maps could act.
- `CONTEXT_EXCLUSIVE_BLOCK`: an exclusive context blocked lower-priority contexts for the frame.

## Downstream Evidence Format

A future Sinan adapter POC should attach a diagnostics section to each acceptance run:

```txt
inputflowCommit: <git sha or package version>
sinanAdapterCommit: <git sha from Sinan repo>
browser: <name/version when browser source is involved>
os: <name/version>
fixture: <InputFlow fixture or trace name>
command: <exact command that produced the evidence>
diagnostics:
  - severity
    code
    message
    mapId
    bindingId
    actionId
    contextId
    control
    path
    overrideIndex
decision:
  status: accepted | blocked | risk-accepted
  owner: Sinan | InputFlow | shared
  notes: <short downstream explanation>
```

The `decision` block is downstream-owned. InputFlow provides generic input diagnostics; Sinan decides how those diagnostics are surfaced to developers, QA, gameplay code, editor tooling, or release gates.

## Handoff Boundaries

InputFlow provides:

- The generic diagnostic type and code list.
- Compile-time diagnostics for maps and overrides.
- Runtime debug diagnostics for context consumption/blocking.
- Replay and fixture evidence that can trigger the diagnostics deterministically.

Sinan owns:

- Adapter log formatting and storage.
- UI, editor, or console presentation.
- Which diagnostics become release-blocking in the Sinan repository.
- Mapping diagnostics to EngineMode, EventSystem, World, Three, or scene concepts.
- The final action namespace and context priority policy.

## Verification

InputFlow-side verification for this handoff asset:

```powershell
pnpm vitest run packages/core/test/diagnostics.test.ts packages/core/test/override.test.ts packages/testing/test/input-flow-debug.test.ts packages/schema/test/input-map-schema.test.ts packages/testing/test/sinan-adapter-contract.test.ts
pnpm docs:check
```

These commands prove the current diagnostics model and Sinan fixture tests remain valid inside this repository. They do not prove that a real Sinan adapter has been implemented or accepted downstream.
