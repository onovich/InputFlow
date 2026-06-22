# InputFlow Phase 9 Final Report

Date: 2026-06-22
Status: DRAFT after Round 12, pending Rounds 13-16 final validation

## Scope

- v0.1 release candidate policy and reviewer-facing entry points.
- Required remote GitHub Actions evidence for validate and browser smoke.
- Remote release dry-run evidence.
- Optional browser matrix evidence as release-confidence signal only.
- README, changelog, package metadata, package dry-run audit, and release notes.

Phase 9 explicitly excludes npm publish, GitHub Release, git tag creation,
secrets, a Sinan package, React diagnostics, and rebind UI work.

## Draft RC Readiness

Current Phase 9 evidence supports a provisional `RC_READY` direction, but this
report is not final until Round 16 refreshes local validation, package dry-run,
release dry-run, browser smoke, browser matrix, and remote GitHub Actions
evidence after the last RC validation commit.

## Evidence Snapshot

- Required remote validate: `validate.yml` run `27939752996`, success on
  commit `33d7e749d85f575340ca1a3a19354c83479fbba9`.
- Required remote browser smoke: `browser-smoke.yml` run `27939752999`,
  success on commit `33d7e749d85f575340ca1a3a19354c83479fbba9`.
- Remote release dry-run: `release-dry-run.yml` run `27939958958`, success on
  commit `e44093b28fcd2779e3dbd4162c71e0a2b1578563`.
- Optional browser matrix: `optional-browser-matrix.yml` run `27940149513`,
  success on commit `b65613aa4c3c98a2c85e63618d6d17cb31a39f8c`.
- Remote evidence document:
  `docs/InputFlow-Phase9-Remote-CI-Evidence.md`.
- Package dry-run audit:
  `docs/InputFlow-Phase9-Package-Dry-Run-Audit.md`.
- Changelog / RC notes: `CHANGELOG.md`.

## Local Validation Snapshot

- `pnpm validate`: passed through the commit wrapper in Rounds 10 and 11 with
  27 test files and 86 tests.
- `pnpm browser:test:all`: passed in Round 10 with 45 tests across Chromium,
  Firefox, and WebKit.
- `pnpm release:dry-run`: passed in Round 11 with Chromium browser smoke and
  package dry-run.
- `pnpm package:dry-run`: passed in Round 11 for `@inputflow/core`,
  `@inputflow/schema`, `@inputflow/testing`, and `@inputflow/browser`.
- `pnpm docs:check`, `pnpm structure:check`, and `git diff --check` passed for
  Round 11 documentation and guard changes.
- Round 13 buffer refresh: `pnpm validate`, `pnpm package:dry-run`,
  `git diff --check`, and BOM checks passed with no drift or repair required.

## Corrective Work

Phase 9 found and fixed two real remote CI issues before recording PASS
evidence:

- `actions/setup-node@v4` with `cache: pnpm` ran before `pnpm` existed on the
  GitHub runner. Fixed by adding `pnpm/action-setup@v4` before setup-node.
- Browser workflows loaded `packages/*/dist` before building packages on fresh
  runner checkouts. Fixed by adding `pnpm build` before browser, release, and
  optional browser gates.

Both fixes are now covered by `scripts/check-workflows.mjs`.

## Git Record Draft

- Phase 9 baseline before Round 1: `58fd689`.
- Latest pushed commit entering this Round 12 draft: `0434733`.
- Final report draft commit: this Round 12 report update on `main`.

Per-round commits so far:

- Round 1: `3b544e1` docs: add v0.1 rc policy adr
- Round 2: `563f702` docs: add remote ci observation guide
- Round 3: `119190a` docs: add inputflow readme
- Round 4: `a612257` chore: add package metadata for rc
- Round 5: `0ed4b4e` test: add package metadata guard
- Round 6: `8493594` docs: add v0.1 rc changelog
- Round 7: `b0f2383` docs: align readme api examples
- Round 8a: `fa23f7e` ci: setup pnpm before node cache
- Round 8b: `56e7ea4` test: bound browser smoke on ci
- Round 8c: `33d7e74` ci: build packages before browser gates
- Round 8d: `e44093b` docs: record required remote ci evidence
- Round 9: `b65613a` docs: record remote release dry-run evidence
- Round 10: `80edb8e` docs: record optional browser matrix evidence
- Round 11: `0434733` docs: add phase 9 package dry-run audit
- Round 12: this final report draft update commit
- Round 13: this buffer verification update commit

## Buffer Round Use

- Round 13: consumed. Refreshed local validate and package dry-run after the
  Round 12 final report draft. No docs, package, workflow, or tarball drift was
  found.

## Remaining Refreshes

- Round 14 remote CI and optional matrix evidence refresh.
- Round 15 local release confidence refresh.
- Round 16 final validation, final report update, push, and planner/checker
  handoff.

## Remaining Risks

- Final RC status still depends on the last Round 16 local and remote evidence
  refresh.
- Optional Firefox / WebKit matrix remains best effort, not a required release
  gate.
- Physical Gamepad checks remain manual and depend on real controller hardware.
- Local npm environment warnings can appear during `npm pack --dry-run`; they
  are non-blocking while the dry-run command exits successfully.
