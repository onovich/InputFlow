# InputFlow Phase 9 Remote CI Evidence

> Date: 2026-06-22
> Scope: v0.1 release candidate remote GitHub Actions evidence

This document records remote GitHub Actions evidence gathered during Phase 9.
It complements `docs/InputFlow-Remote-CI-Observation-Guide.md`.

## Required Remote Gates

Observed commit:

- Short SHA: `33d7e74`
- Full SHA: `33d7e749d85f575340ca1a3a19354c83479fbba9`
- Branch: `main`

| Workflow | Run id | Branch | Commit | Status | Conclusion | URL | Observed at |
|---|---:|---|---|---|---|---|---|
| `validate.yml` | `27939752996` | `main` | `33d7e749d85f575340ca1a3a19354c83479fbba9` | completed | success | https://github.com/onovich/InputFlow/actions/runs/27939752996 | 2026-06-22 16:30 +08:00 |
| `browser-smoke.yml` | `27939752999` | `main` | `33d7e749d85f575340ca1a3a19354c83479fbba9` | completed | success | https://github.com/onovich/InputFlow/actions/runs/27939752999 | 2026-06-22 16:30 +08:00 |

## Round 8 Findings

Initial required remote runs failed because `actions/setup-node@v4` was asked to
use `cache: pnpm` before `pnpm` existed on the runner. Phase 9 fixed this by
adding `pnpm/action-setup@v4` before `actions/setup-node@v4`.

The first corrected browser-smoke run then failed because the workflow attempted
to load `packages/*/dist` browser harness modules before building packages on
the fresh runner checkout. Phase 9 fixed this by adding `pnpm build` before the
browser smoke, release dry-run, and optional matrix browser gates.

After both fixes, the required remote validate and browser smoke gates passed on
`main`.

## Remote Release Dry-Run

Observed commit:

- Short SHA: `e44093b`
- Full SHA: `e44093b28fcd2779e3dbd4162c71e0a2b1578563`
- Branch: `main`

| Workflow | Run id | Branch | Commit | Status | Conclusion | URL | Observed at |
|---|---:|---|---|---|---|---|---|
| `release-dry-run.yml` | `27939958958` | `main` | `e44093b28fcd2779e3dbd4162c71e0a2b1578563` | completed | success | https://github.com/onovich/InputFlow/actions/runs/27939958958 | 2026-06-22 16:34 +08:00 |

The remote release dry-run executed `pnpm release:dry-run`, including required
Chromium browser smoke and package dry-run checks. Local `pnpm release:dry-run`
also passed in Round 9.

## Optional Browser Matrix

Observed commit:

- Short SHA: `b65613a`
- Full SHA: `b65613aa4c3c98a2c85e63618d6d17cb31a39f8c`
- Branch: `main`

| Workflow | Run id | Branch | Commit | Status | Conclusion | URL | Observed at |
|---|---:|---|---|---|---|---|---|
| `optional-browser-matrix.yml` | `27940149513` | `main` | `b65613aa4c3c98a2c85e63618d6d17cb31a39f8c` | completed | success | https://github.com/onovich/InputFlow/actions/runs/27940149513 | 2026-06-22 16:38 +08:00 |

The optional browser matrix remains a release-confidence signal rather than a
required release gate. The remote job completed Chromium, Firefox, and WebKit
coverage through `pnpm browser:test:all`; the local Round 10
`pnpm browser:test:all` check also passed.

## Round 14 Remote Refresh

Observed commit:

- Short SHA: `858b435`
- Full SHA: `858b435ae8cfcf97edbe9c55fe0d00c1ae34494d`
- Branch: `main`

| Workflow | Run id | Event | Branch | Commit | Status | Conclusion | URL | Observed at |
|---|---:|---|---|---|---|---|---|---|
| `validate.yml` | `27940604220` | push | `main` | `858b435ae8cfcf97edbe9c55fe0d00c1ae34494d` | completed | success | https://github.com/onovich/InputFlow/actions/runs/27940604220 | 2026-06-22 16:46 +08:00 |
| `browser-smoke.yml` | `27940604244` | push | `main` | `858b435ae8cfcf97edbe9c55fe0d00c1ae34494d` | completed | success | https://github.com/onovich/InputFlow/actions/runs/27940604244 | 2026-06-22 16:46 +08:00 |
| `optional-browser-matrix.yml` | `27940638294` | workflow_dispatch | `main` | `858b435ae8cfcf97edbe9c55fe0d00c1ae34494d` | completed | success | https://github.com/onovich/InputFlow/actions/runs/27940638294 | 2026-06-22 16:47 +08:00 |

Local Round 14 verification also passed `pnpm workflow:check` and
`pnpm browser:test:all` with 45 tests across Chromium, Firefox, and WebKit.

## Pending Remote Evidence

Still pending for later Phase 9 rounds:

- Final Phase 9 evidence refresh after the last required RC validation commit.
