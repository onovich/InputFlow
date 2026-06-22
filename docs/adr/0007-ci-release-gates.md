# ADR 0007: CI Release Gates

> Status: Accepted for Phase 8
> Date: 2026-06-22

## Context

Phase 7 established local real-browser confidence for `@inputflow/browser`:
required Chromium smoke, optional Chromium / Firefox / WebKit matrix, and a
local `pnpm release:dry-run` command that runs required browser smoke before
package dry-run.

Phase 8 needs to turn those local checks into repeatable CI and release gates
without changing the core runtime architecture or making routine validation
slow and fragile.

The current project constraints are:

- `pnpm validate` must stay the fast deterministic baseline.
- Browser smoke requires Playwright browser installation and should remain an
  explicit gate.
- Optional Firefox / WebKit coverage must not pretend to be a required PR gate.
- No Phase 8 workflow may require private secrets, npm publish credentials, or
  GitHub release credentials.
- Physical Gamepad hardware is not automatable in the current CI scope.

## Decision

Use GitHub Actions as the default CI target for Phase 8 because the project
remote is hosted on GitHub.

CI gates are split into three layers:

- Required validation gate: install dependencies and run `pnpm validate`.
- Required browser smoke / release gate: install Playwright Chromium and run
  `pnpm browser:test` or `pnpm release:dry-run`.
- Optional browser matrix: run `pnpm browser:test:all` through manual dispatch
  or another clearly documented best-effort trigger.

Release dry-run remains a dry confidence check only. It must not publish npm
packages, create GitHub releases, mutate versions, or require credentials.

Physical Gamepad hardware coverage is handled through a manual release
checklist, separate from automated CI.

## Rationale

Keeping `pnpm validate` separate from Playwright smoke preserves the local and CI
baseline that already covers lint, typecheck, build, unit tests, structure
checks, and docs checks.

Running required Chromium smoke as an explicit CI gate makes browser source
regressions visible without forcing every deterministic validation command to
install browser binaries.

Keeping Firefox and WebKit in an optional matrix matches ADR 0006: they are
valuable release-confidence signals, but they may depend on browser binary
availability or platform behavior. If the environment is stable later, a future
ADR can promote them to required.

Manual Gamepad checklist coverage is honest about current automation limits.
The automated browser fixture validates mapping and polling logic; a human
release checklist covers physical pairing risk without inventing unstable
hardware automation.

## Required Workflow Shape

Phase 8 workflows should use:

- `actions/checkout`
- `actions/setup-node`
- Corepack-managed pnpm from `packageManager`
- `pnpm install --frozen-lockfile`
- `pnpm validate`
- `pnpm exec playwright install chromium` for required browser smoke
- `pnpm browser:test`
- `pnpm release:dry-run`

Optional matrix workflows may install all Playwright browsers with
`pnpm browser:install` and run `pnpm browser:test:all`.

## Workflow Triggers

The release dry-run workflow is manually triggered with `workflow_dispatch` in
Phase 8. It is a release-confidence gate, not an automatic npm publish or
GitHub release workflow.

Required validate and required Chromium smoke workflows may run on pull requests
and pushes to `main`. Optional browser matrix workflows should remain manual or
otherwise explicitly best-effort until the cross-engine environment is proven
stable in CI.

## Architecture Boundaries

- CI configuration belongs in `.github/workflows`, scripts, and docs.
- Playwright setup belongs in workflow/test tooling, not in `@inputflow/core`.
- `@inputflow/core` must remain free of DOM, React, Three, Sinan, Zod hot-path,
  Playwright, and GitHub Actions dependencies.
- CI must call public package scripts rather than duplicating package internals.

## Consequences

- Pull-request validation remains cheap and deterministic.
- Browser regressions have an explicit required Chromium gate.
- Optional cross-engine behavior remains visible without becoming an unstable
  default blocker.
- Release confidence is repeatable locally and in CI through the same
  `pnpm release:dry-run` script.
- Real publish/release automation remains a future phase.
