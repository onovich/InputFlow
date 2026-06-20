# ADR 0005: Schema Hot-Path Boundary

> Status: Accepted for Phase 0-6
> Date: 2026-06-20

## Context

Input maps, overrides, replay traces, and diagnostics need schema validation and migration. At the same time, frame-time input update must stay small, deterministic, and free of optional authoring dependencies such as Zod.

## Decision

Schema validation belongs to load-time, migration-time, authoring-time, and test-time boundaries. The frame hot path uses compiled binding graph data and must not import or execute schema validators.

`@inputflow/schema` may depend on Zod or a later chosen schema library. `@inputflow/core` must not depend on `@inputflow/schema`.

## Consequences

- Invalid maps and overrides are caught before they enter runtime state.
- Runtime update can remain dependency-light and predictable.
- Hosts can pre-validate configuration and ship compiled or validated data without carrying schema code in hot paths.

## Validation

- Package dependency checks confirm `@inputflow/core` does not depend on `@inputflow/schema` or Zod.
- Tests cover invalid maps, invalid overrides, and diagnostics through schema/package boundaries.
- Frame update tests do not require schema imports.
