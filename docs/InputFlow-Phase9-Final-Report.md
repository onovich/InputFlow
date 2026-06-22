# InputFlow Phase 9 Final Report

Date: 2026-06-22
Status: RC_READY after Round 16 final validation

## Scope

- v0.1 release candidate policy and reviewer-facing entry points.
- Required remote GitHub Actions evidence for validate and browser smoke.
- Remote release dry-run evidence.
- Optional browser matrix evidence as release-confidence signal only.
- README, changelog, package metadata, package dry-run audit, and release notes.

Phase 9 explicitly excludes npm publish, GitHub Release, git tag creation,
secrets, a Sinan package, React diagnostics, and rebind UI work.

## RC Readiness

Phase 9 concludes `RC_READY` for the v0.1 release candidate review target
`003396ac240c7f9cc0f4aac96e0ee0c556fbb796`.

This means the required local validation, required remote validate, required
remote Chromium smoke, remote release dry-run, package dry-run audit, README,
changelog, and release-candidate documentation are complete. It does not mean
that npm packages were published, a GitHub Release was created, or a git tag was
created.

## Evidence Snapshot

- Required remote validate: `validate.yml` run `27939752996`, success on
  commit `33d7e749d85f575340ca1a3a19354c83479fbba9`.
- Required remote browser smoke: `browser-smoke.yml` run `27939752999`,
  success on commit `33d7e749d85f575340ca1a3a19354c83479fbba9`.
- Remote release dry-run: `release-dry-run.yml` run `27939958958`, success on
  commit `e44093b28fcd2779e3dbd4162c71e0a2b1578563`.
- Optional browser matrix: `optional-browser-matrix.yml` run `27940149513`,
  success on commit `b65613aa4c3c98a2c85e63618d6d17cb31a39f8c`.
- Round 14 remote refresh: `validate.yml` run `27940604220`,
  `browser-smoke.yml` run `27940604244`, and
  `optional-browser-matrix.yml` run `27940638294` all succeeded on commit
  `858b435ae8cfcf97edbe9c55fe0d00c1ae34494d`.
- Round 16 final remote evidence: `validate.yml` run `27940867958`,
  `browser-smoke.yml` run `27940867703`, `release-dry-run.yml` run
  `27940902512`, and `optional-browser-matrix.yml` run `27940902609` all
  succeeded on commit `003396ac240c7f9cc0f4aac96e0ee0c556fbb796`.
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
- Round 14 evidence refresh: `pnpm workflow:check` and
  `pnpm browser:test:all` passed locally with 45 tests across Chromium,
  Firefox, and WebKit.
- Round 15 release confidence refresh: `pnpm validate`, `pnpm browser:test`,
  `pnpm release:dry-run`, `pnpm package:dry-run`, `pnpm docs:check`,
  `git diff --check`, and BOM checks passed.
- Round 16 final validation: `pnpm validate`, `pnpm workflow:check`,
  `pnpm browser:test`, `pnpm browser:test:all`, `pnpm release:dry-run`,
  `pnpm package:dry-run`, `git diff --check`, and BOM checks passed.

## Corrective Work

Phase 9 found and fixed two real remote CI issues before recording PASS
evidence:

- `actions/setup-node@v4` with `cache: pnpm` ran before `pnpm` existed on the
  GitHub runner. Fixed by adding `pnpm/action-setup@v4` before setup-node.
- Browser workflows loaded `packages/*/dist` before building packages on fresh
  runner checkouts. Fixed by adding `pnpm build` before browser, release, and
  optional browser gates.

Both fixes are now covered by `scripts/check-workflows.mjs`.

## Git Record

- Phase 9 baseline before Round 1: `58fd689`.
- Latest pushed commit entering Round 16 final report update: `003396a`.
- Final report commit: this Round 16 report update on `main`.

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
- Round 12: `8dd59c7` docs: draft phase 9 final report
- Round 13: `858b435` docs: record phase 9 buffer verification
- Round 14: `88ea0f3` docs: refresh phase 9 remote ci evidence
- Round 15: `003396a` docs: record phase 9 release confidence
- Round 16: this final report update commit

## Buffer Round Use

- Round 13: consumed. Refreshed local validate and package dry-run after the
  Round 12 final report draft. No docs, package, workflow, or tarball drift was
  found.
- Round 14: consumed. Refreshed required remote validate, required remote
  browser smoke, optional remote browser matrix, local workflow guard, and local
  three-browser smoke. No repair was required.
- Round 15: consumed. Refreshed local validate, required Chromium smoke,
  release dry-run, standalone package dry-run, docs guard, whitespace, and BOM
  checks. No repair was required.
- Round 16: consumed. Refreshed final local validation, required remote
  validate, required remote browser smoke, remote release dry-run, optional
  remote browser matrix, package dry-run, whitespace, and BOM checks. No repair
  was required.

## Remaining Risks

- Optional Firefox / WebKit matrix remains best effort, not a required release
  gate.
- Physical Gamepad checks remain manual and depend on real controller hardware.
- Local npm environment warnings can appear during `npm pack --dry-run`; they
  are non-blocking while the dry-run command exits successfully.
- The final docs-only report closure commit should still be observed after push
  and reported to the planner/checker handoff.
