# ADR 0001: Package Manager

> Status: Accepted for Phase 0-6
> Date: 2026-06-20

## Context

InputFlow is planned as a small TypeScript monorepo with first-party packages for `core`, `schema`, `testing`, and `browser`. The repository needs deterministic workspace installs, clear package boundaries, and a single command surface for validation.

The design document originally allowed npm workspaces, while the Sinan alignment notes recommend `pnpm workspace` for stricter monorepo dependency boundaries and consistency with adjacent Web game infrastructure work.

## Decision

Use `pnpm workspace` for Phase 0-6.

The root package will declare a pinned `packageManager` field, and `pnpm-workspace.yaml` will be the workspace source of truth. Agents and contributors should not mix npm workspace behavior into this repository unless a future ADR changes the decision.

## Consequences

- Workspace package discovery is explicit through `pnpm-workspace.yaml`.
- Validation commands should be rooted in `pnpm` scripts.
- Lockfile ownership belongs to `pnpm-lock.yaml`.
- npm may still be used only for one-off environment inspection, not for installing dependencies or generating workspace metadata.

## Validation

- `pnpm install` succeeds.
- `pnpm -r list --depth -1` discovers all first-party packages.
- Root `pnpm validate` becomes the baseline validation command from Round 3 onward.
