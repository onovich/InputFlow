# ADR 0006: Browser Matrix Strategy

> Status: Accepted for Phase 7
> Date: 2026-06-22

## Context

Phase 0-6 established `@inputflow/browser` with Keyboard, Pointer, wheel,
editable target filtering, blur reset, and basic Gamepad sources. The remaining
Phase 0-6 release risk is that browser source tests still use DOM-like fixtures
instead of a real Chromium / Firefox / WebKit matrix.

The current project baseline is:

- pnpm workspace with TypeScript project references.
- Vitest node environment for deterministic unit and package tests.
- `pnpm validate` runs lint, typecheck, build, tests, structure checks, and docs
  checks.
- `@inputflow/browser` is the only package with DOM lib enabled.
- `@inputflow/core` must remain free of DOM, React, Three, Sinan, Zod hot-path,
  and browser test harness dependencies.

Phase 7 needs a repeatable browser smoke harness while keeping default
validation cheap and stable.

## Decision

Use Playwright test runner as the Phase 7 browser smoke harness.

The browser matrix is split into two layers:

- Required matrix: Chromium.
- Optional matrix: Firefox and WebKit best effort, with explicit commands and
  documented limitations when local browser dependencies are unavailable or
  unstable.

Vitest remains the default unit test runner for node and package-level tests.
Playwright smoke tests are introduced as separate scripts, not as part of the
default `pnpm validate` path during Phase 7. A later release gate may run
Playwright required smoke explicitly through the ops workflow once the harness
is stable.

## Rationale

Playwright test runner directly models the Phase 7 requirement: start a real
browser page, attach browser sources, dispatch real DOM events, and assert
InputFlow action snapshots. It also has first-class Chromium / Firefox / WebKit
project support.

Vitest Browser Mode remains a reasonable future option, but adopting it for
Phase 7 would add another Vitest execution mode to a repository that currently
uses a simple node test environment. Playwright keeps the real-browser smoke
layer separate from deterministic unit tests and makes required vs optional
browser matrix boundaries explicit.

Keeping browser smoke outside default `pnpm validate` preserves the current
fast local validation contract. This matters because Phase 7 browser checks may
need browser binary installation, platform-specific dependencies, or best-effort
optional engines.

## Commands

Phase 7 will add commands with this shape:

```txt
pnpm browser:test          # required Chromium smoke
pnpm browser:test:all      # Chromium, Firefox, and WebKit best effort
pnpm browser:install       # install Playwright browser dependencies when needed
```

Exact names may be refined during harness implementation, but the split between
required Chromium and optional all-browser matrix must remain clear.

## Validation Policy

Per-round Phase 7 validation:

- Round 1 documentation strategy: `git diff --check`, `pnpm docs:check`.
- Round 2 harness scaffold: dependency restore, typecheck, and smoke list/help or
  an empty smoke test.
- Round 3 onward: required Chromium browser smoke plus `pnpm validate`.
- Round 10 onward: optional Firefox / WebKit smoke best effort, with results
  recorded.
- Round 15-16: required browser smoke, optional best effort, and
  `pnpm package:dry-run`.

## Optional Matrix Status

Round 10 verified the optional browser matrix on 2026-06-22. The first
`pnpm browser:test:all` run failed at the harness setup layer because the local
Firefox and WebKit Playwright binaries were not installed. After running
`pnpm exec playwright install firefox webkit`, the full Chromium, Firefox, and
WebKit smoke matrix passed with 45 tests.

## Architecture Boundaries

- Playwright config, fixtures, and page harness code belong in test/config/docs
  layers, not in `@inputflow/core`.
- Browser-specific helpers may live in `@inputflow/browser` only when they are
  package behavior, not test harness convenience.
- Browser smoke tests should exercise public package APIs rather than internal
  source files whenever practical.
- The browser matrix must not introduce Sinan, React, Three, or DOM dependencies
  into `@inputflow/core`.

## Gamepad Automation Strategy

Playwright cannot reliably drive physical Gamepad hardware across local and CI
machines. Phase 7 therefore treats real hardware pairing, nonstandard devices,
and long-lived player assignment as out of scope.

Automated browser coverage uses a real browser page with a browser-level
`getGamepads` fixture. This validates that `BrowserGamepadSource` polls in the
browser JavaScript environment and maps the v0.1 scope correctly:

- South button to `<Gamepad>/button/south`.
- Left stick to `<Gamepad>/stick/left`.
- Disconnect / missing pad reset to neutral values.

Physical hardware remains a manual release checklist item until InputFlow has a
broader device pairing policy.

## Consequences

- Phase 7 gains a real-browser validation path without destabilizing the default
  unit validation loop.
- Browser failures can be classified as harness setup, browser installation,
  page fixture, DOM event payload, source attach, raw event queue, device state,
  or binding runtime failures.
- Firefox and WebKit coverage remains honest: required only if stable in the
  current environment, otherwise documented as optional with explicit commands.
