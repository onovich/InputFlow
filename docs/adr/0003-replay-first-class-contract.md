# ADR 0003: Replay First-Class Contract

> Status: Accepted for Phase 0-6
> Date: 2026-06-20

## Context

Replay is required for deterministic tests, AI smoke checks, and Sinan Gate interaction validation. Treating replay as a later test helper would leave the central contract under-tested and would make browser behavior appear more important than deterministic input mechanics.

## Decision

Replay is a v0.1 first-class contract.

Phase 0-6 will define a raw control trace format, context lifecycle events, a replay runner, and action snapshot trace assertions. Replay must run without real DOM events and without reading real wall-clock time.

## Consequences

- Virtual input and injected clock are part of the main product shape, not test-only patches.
- Raw control traces can drive context activation, control values, frame boundaries, and deactivation.
- Action snapshot traces become durable evidence for deterministic behavior.

## Validation

- Same input map plus same trace produces the same action snapshot trace.
- Replay tests run in Node/Vitest without browser globals.
- Browser source tests are not required to prove core replay correctness.
