# InputFlow Remote CI Observation Guide

> Date: 2026-06-22
> Scope: Phase 9 v0.1 release candidate remote GitHub Actions evidence

This guide explains how to observe and record remote GitHub Actions evidence for
the v0.1 release candidate. Local commands remain useful, but Phase 9 must not
claim remote CI PASS without a run id or URL.

## Required Tools

Preferred tool:

```powershell
gh --version
gh auth status
```

If `gh` is missing, unauthenticated, or not authorized for
`onovich/InputFlow`, record the reason and stop remote CI observation as
`BLOCKED` until a maintainer supplies access or equivalent browser evidence.

Equivalent GitHub web UI evidence is acceptable when it includes the same run
id, commit, conclusion, and URL.

## Required Remote Gates

Required for full `RC_READY`:

| Gate | Workflow file | Expected branch | Required conclusion |
|---|---|---|---|
| Validate | `validate.yml` | `main` | `success` |
| Chromium smoke | `browser-smoke.yml` | `main` | `success` |
| Release dry-run | `release-dry-run.yml` | `main` | `success` |

Optional release-confidence evidence:

| Gate | Workflow file | Expected branch | Required conclusion |
|---|---|---|---|
| Optional browser matrix | `optional-browser-matrix.yml` | `main` | `success` or documented non-blocking failure |

The optional browser matrix must stay manual / best effort unless a future ADR
changes ADR 0006 and ADR 0007.

## Observe Latest Required Runs

List recent runs:

```powershell
gh run list --repo onovich/InputFlow --workflow validate.yml --branch main --limit 5
gh run list --repo onovich/InputFlow --workflow browser-smoke.yml --branch main --limit 5
```

For each candidate run, inspect details:

```powershell
gh run view <run-id> --repo onovich/InputFlow --json databaseId,workflowName,headBranch,headSha,status,conclusion,url,createdAt,updatedAt
```

A run counts as current Phase 9 evidence only when:

- `headBranch` is `main`.
- `headSha` is the commit being evaluated, or the report explicitly explains why
  an older pushed commit is the relevant evidence.
- `status` is `completed`.
- `conclusion` is `success`.
- The run URL is recorded.

## Trigger Manual Release Dry-Run

Trigger the manual workflow:

```powershell
gh workflow run release-dry-run.yml --repo onovich/InputFlow --ref main
```

Then list and view the newest run:

```powershell
gh run list --repo onovich/InputFlow --workflow release-dry-run.yml --branch main --limit 5
gh run view <run-id> --repo onovich/InputFlow --json databaseId,workflowName,headBranch,headSha,status,conclusion,url,createdAt,updatedAt
```

Do not treat successful local `pnpm release:dry-run` as a remote release dry-run
PASS. If the manual dispatch cannot be triggered because of permissions,
authentication, workflow visibility, or GitHub service failure, record the exact
reason and report `BLOCKED` or `RC_READY_LOCAL_ONLY` according to ADR 0008 and
the Phase 9 final report.

## Trigger Optional Browser Matrix

Trigger only when permissions and runner capacity allow it:

```powershell
gh workflow run optional-browser-matrix.yml --repo onovich/InputFlow --ref main
```

Inspect the newest run:

```powershell
gh run list --repo onovich/InputFlow --workflow optional-browser-matrix.yml --branch main --limit 5
gh run view <run-id> --repo onovich/InputFlow --json databaseId,workflowName,headBranch,headSha,status,conclusion,url,createdAt,updatedAt
```

Record optional matrix failures as release-confidence findings, not required PR
gate failures, unless a future ADR changes the gate policy.

## Evidence Record Template

Use one row per workflow run:

| Workflow | Run id | Branch | Commit | Status | Conclusion | URL | Observed at |
|---|---|---|---|---|---|---|---|
| validate.yml |  | main |  | completed | success / failure |  |  |
| browser-smoke.yml |  | main |  | completed | success / failure |  |  |
| release-dry-run.yml |  | main |  | completed | success / failure |  |  |
| optional-browser-matrix.yml |  | main |  | completed | success / failure / skipped |  |  |

## BLOCKED Classification

Use these labels in the final report when remote evidence cannot be completed:

- `NO_GH_CLI`: GitHub CLI is unavailable in the executor environment.
- `GH_AUTH_REQUIRED`: `gh auth status` does not have usable repository access.
- `WORKFLOW_NOT_FOUND`: the named workflow is missing or disabled remotely.
- `RUN_NOT_TRIGGERED`: no run exists for the evaluated branch / commit.
- `DISPATCH_FORBIDDEN`: manual workflow dispatch is not permitted.
- `RUN_IN_PROGRESS`: run started but did not finish inside the execution window.
- `RUN_FAILED`: run completed with a failing conclusion.
- `STALE_COMMIT`: latest successful run does not cover the evaluated commit.

Do not convert a BLOCKED remote gate into PASS by citing local validation.
