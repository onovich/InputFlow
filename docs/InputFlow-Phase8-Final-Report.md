# InputFlow Phase 8 Final Report

Date: 2026-06-22
Status: Draft after Round 13 buffer verification

## Scope

- Validate CI: GitHub Actions workflow for `pnpm validate`.
- Required browser smoke CI: GitHub Actions workflow for Chromium
  `pnpm browser:test`.
- Release dry-run CI: manual GitHub Actions workflow for
  `pnpm release:dry-run`.
- Optional browser matrix: manual GitHub Actions workflow for
  `pnpm browser:test:all`.
- CI troubleshooting: failure classification and local reproduction guide.
- Manual Gamepad checklist: physical controller release-confidence checklist.

## PASS Evidence

- Validate workflow: `.github/workflows/validate.yml` installs dependencies and
  runs `pnpm validate`.
- Browser smoke workflow: `.github/workflows/browser-smoke.yml` installs
  Chromium and runs `pnpm browser:test`.
- Release dry-run workflow: `.github/workflows/release-dry-run.yml` is manual
  and runs `pnpm release:dry-run`.
- Optional matrix workflow: `.github/workflows/optional-browser-matrix.yml` is
  manual and runs `pnpm browser:test:all`.
- Cache / artifact policy: browser workflows cache `~/.cache/ms-playwright` and
  upload `test-results/browser` on failure.
- Gamepad checklist: `docs/InputFlow-Manual-Gamepad-Release-Checklist.md`.
- Dependency boundary: CI and Playwright configuration stays in workflows,
  scripts, tests, and docs; `@inputflow/core` remains free of Playwright and DOM
  dependencies.

## Validation Results

- `git diff --check`: passed through Round 12.
- `pnpm validate`: passed through Round 13, with 27 test files and 86 tests.
- `pnpm browser:test`: passed through Round 13 with 15 Chromium tests.
- `pnpm browser:test:all`: passed in Round 6 with 45 tests across Chromium,
  Firefox, and WebKit. Round 14-16 will refresh this result.
- `pnpm release:dry-run`: passed through Round 11.
- Workflow structure check: `pnpm workflow:check` and `pnpm structure:check`
  passed through Round 13.

## Git Record

- Phase 8 baseline before Round 1: `38d2aba`.
- Latest pushed commit entering Round 13: `2a43c55`.
- Final commit: pending Round 16.
- Pushed branch: `main`.

Per-round commits:

- Round 1: `dad2977` docs: add phase 8 ci gate strategy
- Round 2: `aef203e` ci: scaffold release gate workflows
- Round 3: `32f95c6` ci: add validate workflow
- Round 4: `3ef25e4` ci: add required browser smoke workflow
- Round 5: `f47c724` ci: add release dry-run workflow
- Round 6: `dd5d6f9` ci: add optional browser matrix workflow
- Round 7: `161e12c` ci: add browser cache and failure artifacts
- Round 8: `c2638f0` docs: add ci troubleshooting guide
- Round 9: `e82688a` docs: add manual gamepad release checklist
- Round 10: `1ab0aae` docs: sync phase 8 ops gates
- Round 11: `87c7c35` test: add workflow parity check
- Round 12: `2a43c55` docs: draft phase 8 final report
- Round 13: pending
- Round 14: pending
- Round 15: pending
- Round 16: pending

## Buffer Round Use

- Round 13: consumed. Verified no workflow, cache, documentation, or command
  drift requiring a fix; `pnpm validate`, `pnpm browser:test`, and
  `pnpm workflow:check` passed.
- Round 14: pending
- Round 15: pending

## Remaining Risks

- GitHub Actions has not been observed from this local environment; local
  validation, workflow structure checks, and package scripts provide substitute
  evidence until remote CI run results are reviewed.
- Optional Firefox / WebKit matrix remains manual best effort, not a required
  pull-request gate.
- Physical Gamepad checks remain manual and depend on available controller
  hardware and browser behavior.
- Local npm config warnings may appear during package dry-run but do not fail
  the dry-run package manifests.

## Next Stage Suggestions

- Review first remote GitHub Actions runs after push and record any environment
  differences.
- Decide whether optional browser matrix should remain manual or become a
  scheduled release-confidence job.
- Decide whether physical Gamepad coverage needs a later hardware-lab
  automation phase.
