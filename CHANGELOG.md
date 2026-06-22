# Changelog

All notable InputFlow release-candidate changes are recorded here.

This file currently describes a v0.1 release candidate draft. It is not a
published release announcement, npm publish record, git tag, or GitHub Release.

## v0.1.0-rc.0 Draft

Date: 2026-06-22
Status: release candidate review draft

### Added

- `@inputflow/core` DOM-free runtime for deterministic input maps, raw event
  queues, device state, binding graphs, processors, interactions, action state,
  context routing, overrides, and diagnostics.
- `@inputflow/schema` load-time schemas for input maps, overrides, migrations,
  and replay traces.
- `@inputflow/testing` virtual input source, fake clock, replay runner, action
  trace helpers, and Sinan adapter contract fixtures.
- `@inputflow/browser` keyboard, pointer, wheel, editable-target filtering,
  blur / visibility reset, attach / detach lifecycle, and basic gamepad source
  coverage.
- Real-browser Playwright smoke tests for Chromium, plus optional Firefox and
  WebKit matrix coverage.
- GitHub Actions workflow definitions for `pnpm validate`, required Chromium
  browser smoke, manual release dry-run, and optional browser matrix.
- CI troubleshooting, remote CI observation, and manual Gamepad release
  checklist documents.
- Manual Gamepad harness guide and Phase 10 physical evidence table for
  release-confidence review without making hardware a required CI gate.
- README, API examples, package metadata, package metadata guard, and package
  dry-run workflow for release candidate review.
- Phase 11 Sinan POC handoff assets: strategy, fixture inventory, blur/reset
  scenario, diagnostics handoff, downstream acceptance checklist, and
  `pnpm sinan:contract:check`.

### Validation Matrix

Local release-candidate review should run:

- `pnpm validate`
- `pnpm workflow:check`
- `pnpm sinan:contract:check`
- `pnpm browser:test`
- `pnpm browser:test:all`
- `pnpm release:dry-run`
- `pnpm package:dry-run`

Remote release-candidate review should record GitHub Actions run ids and URLs
for:

- `validate.yml`
- `browser-smoke.yml`
- `release-dry-run.yml`
- `optional-browser-matrix.yml`

Do not report full `RC_READY` without remote run evidence for the required
gates and the remote release dry-run.

### Known Limits

- The packages are not published to npm by this release-candidate review.
- The repository does not create a git tag or GitHub Release in this
  release-candidate review.
- Package manifests currently use `UNLICENSED` until the owner chooses the
  public distribution license.
- Optional Firefox and WebKit browser matrix remains optional / best effort.
- Automated gamepad coverage uses a browser-level `navigator.getGamepads`
  fixture; Phase 10 adds a manual harness and evidence table, but the current
  executor environment has no physical controller evidence.
- `@inputflow/schema` uses Zod for load-time validation only; schema validation
  must not enter the frame hot path.
- `@inputflow/core` must remain free of DOM, React, Three, Sinan, Playwright,
  GitHub Actions, and release tooling dependencies.

### Non-Goals

- No real npm publish.
- No GitHub Release.
- No git tag.
- No private token or secret integration.
- No automatic publish pipeline.
- No React diagnostics package.
- No rebind UI.
- No mobile virtual joystick.
- No pointer picking, world ray, or entity hit logic.
- No `@inputflow/sinan` package.
- No physical Gamepad lab automation.

### Upgrade / Review Risks

- A real v0.1 publish phase still needs final versioning, license, tag,
  provenance, and release ownership decisions.
- Remote GitHub Actions evidence must be observed on the target commit before
  full RC readiness can be claimed.
- Consumers should treat action ids and context ids as host-owned opaque
  strings; InputFlow does not define game or editor semantics.
