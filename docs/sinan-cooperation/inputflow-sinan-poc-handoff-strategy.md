# InputFlow / Sinan POC Handoff Strategy

Date: 2026-06-22
Status: Phase 11 handoff strategy

## Purpose

Phase 11 turns the existing Sinan POC contract into a handoff packet that the
Sinan repository can implement and verify. The packet is owned by InputFlow, but
the adapter implementation and Sinan engine semantics stay downstream.

This phase does not create an `@inputflow/sinan` package and does not modify the
Sinan repository.

## InputFlow Deliverables

InputFlow can deliver:

- Host-neutral contract documentation for the first Sinan adapter POC.
- `@inputflow/testing` contract fixtures for deterministic replay and adapter
  acceptance.
- A local contract check command that validates only this repository's fixtures,
  docs, and boundary guards.
- Machine-readable diagnostics examples and guidance for downstream reporting.
- A downstream acceptance checklist that tells Sinan what evidence to return.
- README, API example, development-plan, docs-guard, and final-report links for
  the Phase 11 handoff packet.

InputFlow can verify:

- `runtime.gameplay.interact` through Keyboard E, Pointer Primary, and Gamepad
  South fixture traces.
- `editor.viewport.select` as a separate host-owned action id that uses the
  same generic InputFlow binding/runtime mechanics.
- Modal and pause isolation through context routing and replay.
- Blur / focus reset expectations without requiring physical Gamepad hardware.
- Replay trace determinism and diagnostics handoff shape.
- `packages/core` boundary scans for DOM, React, Three, Sinan, Playwright,
  browser runtime, GitHub Actions, and release-tooling contamination.

## Sinan Downstream Deliverables

Sinan must own and return evidence for:

- Final action namespace and action meanings.
- Context names, priorities, routing policy, and activation lifecycle.
- EngineLoop integration and frame ownership.
- World, EventSystem, Director, Three, editor store, and UI consequences.
- Sinan InputMap source-of-truth location, migration policy, and user override
  persistence.
- Adapter commit, test command output, screenshots or logs, unsupported cases,
  and rollout decision.

## Must Not Claim

Phase 11 must not claim:

- A shipped `@inputflow/sinan` package.
- A working Sinan repository adapter.
- Final Sinan action namespace, context priority, EngineMode, World,
  EventSystem, Director, Three, React, or editor-store behavior.
- Physical Gamepad hardware acceptance. Phase 10 remains
  `HARNESS_READY_NO_HARDWARE` until real controller evidence is supplied.
- npm publish, GitHub Release, git tag, license selection, or final versioning.

## Handoff Boundary

```txt
InputFlow generic contract assets
  -> Sinan adapter implementation in the Sinan repository
  -> Sinan InputSystem / EngineLoop / World and editor effects
```

InputFlow owns the first box. Sinan owns the downstream boxes.

## Initial Acceptance Status

The expected final Phase 11 status is `HANDOFF_READY_BLOCKED_DOWNSTREAM` unless
the handoff packet itself cannot be completed. That status means InputFlow-side
assets are ready, while real Sinan repository integration remains downstream
work.
