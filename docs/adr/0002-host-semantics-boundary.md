# ADR 0002: Host Semantics Boundary

> Status: Accepted for Phase 0-6
> Date: 2026-06-20

## Context

InputFlow is a host-neutral input backend/runtime library. Sinan Engine is the first-party design partner, but Sinan must retain ownership of action names, context meaning, engine modes, editor commands, world consequences, and UI policy.

The highest risk is letting InputFlow become a Sinan-specific input framework by importing host stores, interpreting host action ids, or owning camera/picking consequences.

## Decision

`ActionId` and `ContextId` are opaque strings to InputFlow.

InputFlow may index, bind, route, snapshot, and diagnose these ids. It must not define Sinan action namespaces, context priority tables, editor mode semantics, EventSystem behavior, World mutations, Three.js camera behavior, React store behavior, or persistence policy.

## Consequences

- `@inputflow/core` remains reusable across hosts.
- Sinan adapter code stays in the Sinan repository during the first POC.
- InputFlow exposes generic routing and diagnostics instead of host-specific commands.
- Tests should assert package boundaries rather than relying on reviewer memory.

## Validation

- `@inputflow/core` has no imports from DOM globals, React, Three.js, Sinan, or schema validators.
- Sinan POC documentation describes adapter responsibilities without adding `@inputflow/sinan` in Phase 0-6.
