# InputFlow Browser Smoke Guide

> Date: 2026-06-22
> Scope: Phase 7 browser matrix and browser source integration smoke

This guide explains how to reproduce the real-browser smoke checks for
`@inputflow/browser`. It complements ADR 0006, which explains why Phase 7 uses
Playwright and why Chromium is required while Firefox and WebKit are optional
best-effort engines.

## Command Layers

Browser smoke tests are intentionally separate from `pnpm validate` during
Phase 7. The default validation loop stays deterministic and fast; browser
smoke is run explicitly when touching browser sources, validating a release, or
executing the Phase 7 goal guide.

```txt
pnpm browser:test:list     # list Playwright browser smoke tests
pnpm browser:test          # required Chromium smoke
pnpm browser:test:all      # Chromium, Firefox, and WebKit best effort
pnpm browser:install       # install Chromium, Firefox, and WebKit binaries
```

The project ops wrappers expose the same required smoke and release gate:

```txt
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\ReleaseDryRun.cmd
```

`Smoke.cmd` runs the required Chromium browser smoke. `ReleaseDryRun.cmd` runs
the required Chromium browser smoke and then `pnpm package:dry-run`.

The smoke harness serves built package output from `packages/*/dist`. On a
fresh checkout, run dependency restore and build before browser smoke:

```txt
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\RestoreDeps.cmd
pnpm build
pnpm browser:install
pnpm browser:test
```

`pnpm validate` can replace the standalone `pnpm build` step when a full local
check is desired before browser smoke.

## Expected Results

Current Phase 7 baseline:

- Required smoke: `pnpm browser:test` runs Chromium and passes 15 tests.
- Optional smoke: `pnpm browser:test:all` runs Chromium, Firefox, and WebKit and
  passes 45 tests after the optional browser binaries are installed.

The exact test count may grow as more browser coverage is added. Treat the
required Chromium command as the mandatory local signal. Treat Firefox and
WebKit as release confidence signals unless the project policy is tightened in
the ops workflow.

## Covered Sources

The browser smoke suite currently covers:

- Playwright harness boot.
- Keyboard source mapping and repeat behavior.
- Editable target filtering.
- Pointer button mapping, pointercancel, disconnect cleanup, and blur reset.
- Wheel per-frame accumulation and reset.
- Visibility reset for held keyboard state.
- Source attach/detach listener lifecycle.
- Browser gamepad polling through a browser-level `navigator.getGamepads`
  fixture.

The gamepad smoke does not pair with physical hardware. It verifies browser
runtime polling and InputFlow mapping behavior with a deterministic fixture.

## Troubleshooting

| Symptom | Likely cause | Action |
|---|---|---|
| `Executable doesn't exist` for Chromium, Firefox, or WebKit | Playwright browser binary is missing locally | Run `pnpm browser:install`, or run `pnpm exec playwright install firefox webkit` when only optional engines are missing |
| Module import, 404, or missing `dist` file in a smoke page | Package output has not been built in this checkout | Run `pnpm build` or `pnpm validate`, then rerun the browser smoke command |
| `NO_COLOR env is ignored due to FORCE_COLOR` | Node warning from the current terminal environment | Ignore it unless the command exits non-zero |
| Chromium passes but Firefox or WebKit fails | Optional engine setup issue or real cross-engine behavior difference | Re-run `pnpm browser:test:all`, capture the failing engine and error, and record the result in ADR or release notes |
| Gamepad hardware is not detected | Browser smoke uses a deterministic fixture, not physical hardware | Do not use hardware pairing as the automated smoke signal for Phase 7 |
| Browser smoke is flaky after source changes | Event timing, focus, or source lifecycle may have regressed | Run `pnpm exec playwright test --project=chromium --headed` for local inspection, then keep the fix in browser package or tests, not in `@inputflow/core` |

## Architecture Boundaries

Browser smoke helpers belong in `tests/browser`, Playwright config, or docs.
They must not introduce DOM, Playwright, React, Three, Sinan, or fixture
dependencies into `@inputflow/core`.

Browser-specific runtime fixes belong in `@inputflow/browser`. Shared action,
binding, interaction, replay, and routing semantics belong in `@inputflow/core`
only when they are host-agnostic.
