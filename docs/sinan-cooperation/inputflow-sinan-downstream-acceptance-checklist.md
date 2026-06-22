# InputFlow Sinan Downstream Acceptance Checklist

Date: 2026-06-22
Status: Phase 11 handoff asset
Scope: Evidence checklist for a future Sinan repository adapter POC

## Purpose

This checklist defines the evidence a downstream Sinan adapter implementation should return before InputFlow can treat the POC handoff as accepted by the real host repository.

The checklist is intentionally downstream-facing. It does not require this repository to create `@inputflow/sinan`, modify the Sinan repository, publish packages, define Sinan action namespace policy, or claim physical Gamepad acceptance.

## Required Run Metadata

Every downstream acceptance run should include:

- InputFlow commit or package version.
- Sinan adapter repository commit.
- Sinan branch name.
- Operating system and version.
- Browser name and version when browser sources are used.
- Node.js and package-manager versions.
- Exact command line for every test, smoke, or harness run.
- Fixture or trace name used for each assertion.
- Whether the evidence was collected from CI, local automation, or manual review.

## Required Contract Coverage

The downstream adapter should return evidence for:

- `runtime.gameplay.interact` through Keyboard E.
- `runtime.gameplay.interact` through Pointer Primary.
- `runtime.gameplay.interact` through basic Gamepad South when a compatible device path is available.
- `editor.viewport.select` through Pointer Primary.
- Modal context blocking gameplay interaction.
- Pause context blocking gameplay interaction.
- Gameplay restoration after pause context release.
- Browser blur or visibility reset clearing held controls.
- Replay trace determinism for the Sinan contract fixture.
- Diagnostics capture for consumed controls and exclusive context blocking.

If a scenario is not applicable in the Sinan repository, the downstream report must mark it as `not-applicable` with a reason and an owner.

## Required Evidence Artifacts

The downstream packet should attach:

- Test command output or CI run URL.
- Replay output or summarized action snapshots.
- Diagnostics payloads using the fields from `docs/sinan-cooperation/inputflow-sinan-diagnostics-handoff.md`.
- Browser screenshots or logs for browser-source scenarios.
- Manual Gamepad notes only when real hardware was used.
- Unsupported-risk list for any untested device, browser, or editor mode.
- Adapter mapping summary from Sinan controls/actions to InputFlow maps and bindings.

## Acceptance Table

| Area | Minimum evidence | Downstream owner | InputFlow expectation |
|---|---|---|---|
| Runtime interact | Keyboard, pointer, and available gamepad evidence | Sinan adapter | Uses generic InputFlow button action snapshots |
| Editor select | Pointer select evidence | Sinan adapter | Uses `editor.viewport.select` without encoding editor behavior in InputFlow |
| Modal isolation | Modal consumes shared control | Sinan adapter | Preserves `CONTROL_CONSUMED` diagnostics when relevant |
| Pause isolation | Pause blocks gameplay and releases cleanly | Sinan adapter | Preserves context lease semantics |
| Blur reset | Held browser control is released after blur/visibility reset | Sinan adapter | Uses browser source reset behavior, not core DOM coupling |
| Replay | Deterministic fixture replay output | Sinan adapter | Uses `packages/testing` replay helpers or equivalent downstream runner |
| Diagnostics | Compile-time and runtime diagnostic payloads | Sinan adapter | Keeps InputFlow codes and ids intact |
| Boundary | No InputFlow core contamination | Shared review | Sinan semantics stay in adapter/handoff layers |

## Status Values

Downstream acceptance should use one of these status values per scenario:

- `accepted`: evidence proves the scenario against a real Sinan adapter commit.
- `blocked`: evidence cannot be produced because of a bug or missing integration.
- `risk-accepted`: evidence is partial, and the downstream owner accepts the remaining risk.
- `not-applicable`: the scenario is outside the downstream adapter configuration, with a written reason.

## Non-Scope Confirmations

The downstream packet must not claim:

- npm publish, GitHub Release, or git tag completion unless those actions actually occurred later.
- Physical Gamepad acceptance unless a real controller/browser run is attached.
- Final Sinan action namespace, context priority, EngineMode, World, EventSystem, or Three behavior as InputFlow-owned.
- InputFlow core ownership of DOM, React, Three, browser runtime, or Sinan host dependencies.

## InputFlow-Side Verification

Before handing this checklist to a downstream Sinan adapter implementer, this repository should pass:

```powershell
pnpm docs:check
pnpm structure:check
```

These commands prove the checklist is present and discoverable in this repository. They do not prove downstream Sinan adapter acceptance.
