# InputFlow CI Troubleshooting

> Date: 2026-06-22
> Scope: Phase 8 CI release gates and browser smoke workflows

This guide explains how to classify and debug failures in the GitHub Actions
release gates added during Phase 8.

## Gate Layers

| Gate | Workflow | Command | Required |
|---|---|---|---|
| Validate | `.github/workflows/validate.yml` | `pnpm validate` | Yes |
| Chromium smoke | `.github/workflows/browser-smoke.yml` | `pnpm browser:test` | Yes |
| Release dry-run | `.github/workflows/release-dry-run.yml` | `pnpm release:dry-run` | Manual release confidence |
| Optional browser matrix | `.github/workflows/optional-browser-matrix.yml` | `pnpm browser:test:all` | Manual best effort |

`pnpm validate` remains the deterministic baseline. Browser and release gates
are explicit because they install Playwright browsers and may produce browser
artifacts.

## Failure Classification

| Symptom | Likely layer | Action |
|---|---|---|
| `pnpm install --frozen-lockfile` fails | Dependency restore | Run `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\RestoreDeps.cmd` locally and inspect `pnpm-lock.yaml` drift |
| `pnpm validate` fails | Baseline validation | Reproduce with `Validate.cmd`; fix lint, typecheck, build, unit, structure, or docs failure before touching browser workflows |
| Playwright install fails on Linux | Browser install | Re-run the workflow; if persistent, inspect the `pnpm exec playwright install --with-deps ...` step and confirm the browser list matches the workflow |
| `Executable doesn't exist` for a browser | Browser binary missing | Confirm the workflow has a matching Playwright install step; locally run `pnpm browser:install` or targeted `pnpm exec playwright install <browser>` |
| Browser smoke imports fail or page assets 404 | Build output / page harness | Run `pnpm build` or `pnpm validate`, then rerun `pnpm browser:test` locally |
| Browser smoke assertion fails | Source or runtime behavior | Download `test-results/browser` artifact, inspect traces, and reproduce with the matching `pnpm browser:test*` command |
| `NO_COLOR env is ignored due to FORCE_COLOR` | Node terminal warning | Ignore it unless the step exits non-zero |
| `npm warn Unknown env config` during package dry-run | Local npm environment warning | Ignore if `pnpm package:dry-run` exits successfully and prints tarball manifests |
| Optional matrix fails while Chromium required smoke passes | Optional cross-engine signal | Treat it as a release-confidence investigation, not a required PR gate failure |

## Local Reproduction Commands

Use the project wrappers first:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\ReleaseDryRun.cmd
```

Direct package scripts are useful when matching a single CI step:

```powershell
pnpm validate
pnpm browser:test
pnpm browser:test:all
pnpm release:dry-run
pnpm package:dry-run
```

## Artifact Policy

Browser workflows upload `test-results/browser` on failure. That directory is
the Playwright output location for retained traces and browser test results.
Use it to decide whether a failure belongs to browser installation, browser
launch, page harness setup, DOM event payload, source attach/detach, InputFlow
runtime behavior, or package dry-run.

## Required Versus Optional

Required gates:

- Validate workflow.
- Chromium browser smoke workflow.

Manual release confidence:

- Release dry-run workflow.
- Optional browser matrix workflow.

Do not treat the optional matrix as a required pull-request gate unless a future
ADR changes ADR 0006 and ADR 0007.

