# InputFlow Phase 7 Browser Matrix Final Report

Date: 2026-06-22
Status: Draft after Round 15 release-confidence preparation

## Scope

- Browser smoke harness: Playwright test runner with real browser pages.
- Required browser matrix: Chromium through `pnpm browser:test` and `Smoke.cmd`.
- Optional browser matrix: Chromium, Firefox, and WebKit through
  `pnpm browser:test:all`.
- Browser Source coverage: Keyboard, Pointer, wheel, editable target filtering,
  blur / visibility reset, attach / detach lifecycle, and browser-level Gamepad
  fixture coverage.
- Ops workflow integration: `Smoke.cmd` runs required Chromium smoke, and
  `ReleaseDryRun.cmd` runs `pnpm release:dry-run`.

## PASS Evidence

- Keyboard smoke: real browser `KeyboardEvent.code` maps to
  `<Keyboard>/code/KeyE`.
- Pointer smoke: primary pointer button, pointercancel, disconnect cleanup, and
  no host-specific hit semantics in action state.
- Wheel smoke: per-frame wheel accumulation and reset.
- Editable target smoke: gameplay shortcuts are filtered from input, textarea,
  select, and contenteditable targets.
- Blur / visibility reset: held keyboard and pointer state is released on blur
  or hidden visibility changes.
- Attach / detach lifecycle: repeated connect does not duplicate listeners,
  disconnect removes listeners, and reconnect works.
- Gamepad fixture / limitation: automated browser coverage uses a deterministic
  `navigator.getGamepads` fixture; physical hardware pairing remains out of
  Phase 7 scope.
- Dependency boundary: Playwright and browser page helpers stay in test/config
  and docs layers; `@inputflow/core` remains DOM-free.

## Validation Results

- `git diff --check`: passed in Round 15.
- `pnpm validate`: passed in Round 15, with 27 test files and 86 tests.
- Required browser smoke: `pnpm browser:test` passed in Round 15 with 15 Chromium
  tests through `ReleaseDryRun.cmd`.
- Optional browser smoke: `pnpm browser:test:all` passed in Round 15 with 45
  tests across Chromium, Firefox, and WebKit. Round 16 will refresh this result.
- `pnpm package:dry-run`: passed in Round 15 through `ReleaseDryRun.cmd` for
  `@inputflow/core`, `@inputflow/schema`, `@inputflow/testing`, and
  `@inputflow/browser`.

## Git Record

- Phase 7 baseline before Round 1: `a8fae4a`.
- Current draft commit before Round 15 report commit: `e111f27`.
- Final commit: pending Round 16.
- Pushed branch: `main`.

Per-round commits:

- Round 1: `799f0e8` docs: add phase 7 browser matrix strategy
- Round 2: `05bf844` test(browser): scaffold playwright smoke harness
- Round 3: `a467c2b` test(browser): add keyboard source smoke
- Round 4: `81800ff` test(browser): add pointer source smoke
- Round 5: `66ad29e` test(browser): add wheel source smoke
- Round 6: `a4f8137` test(browser): add editable target smoke
- Round 7: `5d9c8a2` test(browser): add blur reset smoke
- Round 8: `9310103` test(browser): add source lifecycle smoke
- Round 9: `675e2d6` test(browser): add gamepad fixture smoke
- Round 10: `54c98c3` docs: record optional browser matrix status
- Round 11: `f988f00` docs: add browser smoke troubleshooting guide
- Round 12: `59e1790` chore: wire browser smoke ops gate
- Round 13: `f3649a4` docs: clarify phase 7 browser follow-up
- Round 14: `e111f27` chore: align release dry-run browser gate
- Round 15: pending
- Round 16: pending

## Buffer Round Use

- Round 13: audited the Phase 0-6 acceptance concerns and clarified that Phase 7
  resolves the historical browser-matrix risk in the Phase 0-6 report.
- Round 14: aligned `pnpm release:dry-run` with the ops release gate so direct
  package-script and wrapper users run the same browser + package confidence
  path.
- Round 15: prepared this final report draft and refreshed release dry-run
  evidence.

## Remaining Risks

- Firefox and WebKit require local Playwright browser binaries; run
  `pnpm browser:install` before optional matrix checks on a fresh machine.
- Automated Gamepad coverage uses a deterministic browser fixture, not physical
  controller hardware pairing.
- Touch, complete rebinding UI, React diagnostics UI, and `@inputflow/sinan`
  remain outside Phase 7 scope.
- Local npm config warnings for unknown keys appear during `npm pack --dry-run`
  but do not fail packaging.

## Next Stage Suggestions

- Add CI jobs for required Chromium smoke and optional browser matrix where the
  runner environment is stable.
- Decide whether physical Gamepad pairing needs a manual release checklist or a
  later hardware-lab automation strategy.
- Keep `pnpm validate` fast, and use `pnpm release:dry-run` as the explicit
  release confidence path.
