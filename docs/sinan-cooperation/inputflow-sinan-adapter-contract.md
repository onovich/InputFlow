# InputFlow / Sinan Adapter Contract

Date: 2026-06-20

## Purpose

This document fixes the v0.1 contract between InputFlow and the first Sinan adapter POC.
The adapter itself stays in the Sinan repository for this phase. This repository provides
generic packages, validation rules, replay fixtures, and contract tests only.

## Ownership Boundary

InputFlow owns:

- `ControlPath` syntax and raw input normalization.
- Generic `InputMap` and override data contracts.
- Binding graph compilation, interactions, context routing, diagnostics, and replay.
- Browser sources for keyboard, pointer, wheel, and basic gamepad input.
- Testing fixtures that Sinan can reuse to validate an adapter.

Sinan owns:

- Action names and their meaning.
- Context names, priority policy, and when contexts are active.
- Persistence location for default maps and user overrides.
- Editor UI, rebinding UI, and diagnostics presentation.
- World, EventSystem, Director, Three, and gameplay effects.

Not in InputFlow v0.1:

- No `@inputflow/sinan` package.
- No Sinan engine mode definitions.
- No direct World/Event/Director/Three calls.
- No React adapter in the hot path.
- No writes from user overrides back into Sinan source-of-truth maps.

## Minimum POC Contract

The first Gate-style adapter POC must prove this chain:

```txt
ControlPath -> Binding -> Interaction -> ActionSnapshot -> Context routing -> Replay trace
```

Required runtime action:

- `runtime.gameplay.interact`

Required controls for the action:

- `<Keyboard>/code/KeyE`
- `<Pointer>/button/primary`
- `<Gamepad>/button/south`

Required context isolation:

- A gameplay context can activate the `gameplay` map.
- A higher-priority modal/editor context can activate a modal map with `consumeMatched`.
- When the modal context consumes the same control, `runtime.gameplay.interact` must stay released.

Required non-goals:

- Pointer picking is not part of InputFlow.
- Text editing shortcuts must be filtered before gameplay actions fire.
- Browser blur or detach must release held state.
- Replay records normalized controls and context lifecycle, not raw DOM events.

## Testing Fixture

`@inputflow/testing` exports a reusable fixture:

```ts
import {
  createSinanGateAdapterContractFixture,
  runSinanGateAdapterContractReplay
} from "@inputflow/testing";
```

The fixture includes:

- Gameplay and modal input maps.
- Replay traces for Keyboard E, Pointer Primary, and Gamepad South.
- A replay trace proving modal input blocks gameplay interact.

Sinan can run these traces against the adapter boundary before wiring gameplay effects.

## Acceptance Checklist

- InputFlow does not own Sinan action naming.
- InputFlow does not own Sinan context priority policy.
- The adapter can keep Sinan fallback input running during rollout.
- The adapter can reproduce the Gate interaction through replay or deterministic fixtures.
- Diagnostics remain machine-readable for unresolved bindings and invalid overrides.
- No Sinan-specific adapter code is added to `@inputflow/core`.
