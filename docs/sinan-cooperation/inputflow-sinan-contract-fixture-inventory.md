# InputFlow / Sinan Contract Fixture Inventory

Date: 2026-06-22
Status: Phase 11 inventory before fixture hardening

## Existing Fixture Surface

The current `packages/testing/src/sinan-adapter-contract.ts` fixture exports:

- `createSinanGateAdapterContractFixture()`
- `runSinanGateAdapterContractReplay()`
- `sinanGateActionIds`
- `sinanGateMapIds`
- `SinanGateAdapterContractFixture`

The fixture currently includes:

- `runtime.gameplay.interact`
- `ui.modal.confirm`
- `gameplay` map
- `modal` map
- Keyboard E interact replay
- Pointer Primary interact replay
- Gamepad South interact replay
- Modal context blocking gameplay interact

The current tests prove:

- Keyboard E, Pointer Primary, and Gamepad South can all drive
  `runtime.gameplay.interact`.
- A higher-priority modal context can consume Keyboard E and keep gameplay
  interact released.

## Phase 11 Required Coverage

Phase 11 needs the handoff packet to cover:

- `runtime.gameplay.interact`
- `editor.viewport.select`
- modal / pause isolation
- blur / focus reset
- replay trace
- diagnostics handoff

## Gaps Before Hardening

| Area | Current state | Gap |
|---|---|---|
| Gameplay interact | Covered by Keyboard E, Pointer Primary, Gamepad South traces | Needs to remain stable while new maps/actions are added. |
| Editor select | Not covered | Add `editor.viewport.select` as an opaque action id with generic InputFlow bindings. |
| Modal isolation | Covered for one modal confirm trace | Split modal and pause isolation expectations so downstream can verify both. |
| Blur / focus reset | Covered in browser tests, not in Sinan handoff docs/fixture intent | Add downstream scenario guidance without moving browser behavior into core. |
| Replay trace | Covered through `runReplayTrace` | Add acceptance wording that Sinan records normalized controls and context lifecycle, not raw DOM events. |
| Diagnostics handoff | Not covered by Sinan fixture | Add examples/guidance for machine-readable diagnostics that Sinan adapter should log/report. |

## Test Intent Before API Changes

Round 3 should add or harden tests that prove:

- `editor.viewport.select` is a normal InputFlow action id, not a Sinan editor
  command implementation.
- The editor select trace uses the same replay runner and generic map mechanics
  as gameplay interact.
- Gameplay and editor actions can coexist without InputFlow defining Sinan mode
  semantics.

Round 4 should add or harden tests that prove:

- Modal isolation still blocks gameplay.
- Pause-style isolation can be expressed as another host-owned context and map.
- Disposing or omitting the high-priority context restores gameplay behavior in a
  deterministic replay.

Round 5 should add docs/tests that prove:

- Blur / focus reset is verified at the browser-source boundary.
- `@inputflow/core` stays unaware of browser globals.
- Downstream Sinan acceptance must check stale held-state behavior without
  treating it as a physical Gamepad PASS.

Round 6 should add docs/tests that prove:

- InputFlow diagnostics are structured handoff data.
- Sinan owns presentation and reporting policy.
- Unresolved bindings or invalid overrides remain generic InputFlow issues, not
  Sinan-specific runtime effects.

## Public API Rule

Do not remove or rename the current exported fixture functions. New helpers may
be added only when they make downstream acceptance clearer and remain generic to
InputFlow mechanics.
