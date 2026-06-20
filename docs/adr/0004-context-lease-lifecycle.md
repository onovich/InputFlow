# ADR 0004: Context Lease Lifecycle

> Status: Accepted for Phase 0-6
> Date: 2026-06-20

## Context

Input conflicts are lifecycle problems as much as priority problems. Modal dialogs, runtime menus, text editing, viewport tools, pointer capture, and debug overlays can overlap. A single `setActiveContext()` API would hide ownership and make restoration bugs hard to diagnose.

## Decision

Contexts are activated through disposable leases.

`activateContext()` returns a `ContextLease` whose `dispose()` method is idempotent. Active contexts are routed by priority and routing policy: `shared`, `consumeMatched`, or `exclusive`. Debug snapshots must expose active context stack, owners, and consumed controls.

## Consequences

- Modal/gameplay isolation can be tested as a lifecycle sequence.
- Multiple overlays can coexist without overwriting a global mode slot.
- Replay can record or deterministically reconstruct context activation and deactivation.

## Validation

- Disposing a lease restores lower-priority contexts when no other higher-priority lease blocks them.
- Repeated `dispose()` calls do not change runtime state after the first call.
- Debug snapshot includes enough context data to diagnose routing.
