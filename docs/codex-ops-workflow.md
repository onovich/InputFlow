<!-- codex-project-ops-workflow: initialized -->
<!-- initialized-at: 2026-06-20 19:23:05 +08:00 -->

# Codex Ops Workflow

Initialization status: initialized
Project: InputFlow
Repository root: D:/LabProjects/Engine/InputFlow
Machine config: `.codex\project-ops-workflow.json`
Skill: project-ops-workflow

Treat this document and .codex/project-ops-workflow.json as the source of truth for mechanical project operations.

## Global Wrappers

```
powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\EnvCheck.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\RestoreDeps.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\InstallDeps.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Build.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Test.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Lint.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Format.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Typecheck.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StructureCheck.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Codegen.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\DocsCheck.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Package.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\ReleaseDryRun.cmd
```

## Validate Sequence

lint, typecheck, build, test, structureCheck, docsCheck

Configured commands:

- Env check: `node --version`, `pnpm --version`
- Restore deps: `pnpm install --frozen-lockfile`
- Install deps: `pnpm install`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Build: `pnpm build`
- Test: `pnpm test`
- Structure check: `pnpm structure:check`
- Docs check: `pnpm docs:check`
- Root validate: `pnpm validate`
- Smoke: `pnpm browser:test`
- Package: `pnpm package:dry-run`
- Release dry-run: `pnpm release:dry-run`

## Browser Smoke And Release Gate

Default validation intentionally excludes Playwright browser smoke so routine
`Validate.cmd` remains deterministic and fast.

Use `Smoke.cmd` for the required Phase 7 Chromium browser smoke:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
```

Use `ReleaseDryRun.cmd` when preparing release confidence. It runs the required
Chromium browser smoke before the package dry-run through `pnpm release:dry-run`:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\ReleaseDryRun.cmd
```

The optional Firefox and WebKit matrix remains explicit:

```powershell
pnpm browser:test:all
```

Install missing Playwright browsers with `pnpm browser:install`.

## CI Release Gates

Phase 8 mirrors the local ops commands into GitHub Actions workflows without
changing the default `Validate.cmd` contract.

| Local gate | CI workflow | Required |
|---|---|---|
| `Validate.cmd` / `pnpm validate` | `.github/workflows/validate.yml` | Yes |
| `Smoke.cmd` / `pnpm browser:test` | `.github/workflows/browser-smoke.yml` | Yes |
| `ReleaseDryRun.cmd` / `pnpm release:dry-run` | `.github/workflows/release-dry-run.yml` | Manual release confidence |
| `pnpm browser:test:all` | `.github/workflows/optional-browser-matrix.yml` | Manual best effort |

Use `docs/InputFlow-CI-Troubleshooting.md` to classify CI failures by layer.
Use `docs/InputFlow-Manual-Gamepad-Release-Checklist.md` for physical controller
release confidence. Physical Gamepad checks are manual and do not run in CI.

## Dev Server

Start command: ``
Health URL: ``
Ready text: ``
Timeout seconds: 30

## Safety Policy

Do not run destructive clean/reset/deploy commands unless the user explicitly asks.
