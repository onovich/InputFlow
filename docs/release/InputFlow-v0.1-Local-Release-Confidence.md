# InputFlow v0.1 Local Release Confidence

Date: 2026-06-22
Status: Local release confidence refreshed for Phase 12.
Workspace: `D:\LabProjects\Engine\InputFlow`

## Summary

The local validation matrix passed before this document was added. These checks
increase release confidence, but they do not replace owner authorization and do
not perform any publish, tag, or GitHub Release action.

| Command | Result | Evidence |
|---|---|---|
| `pnpm validate` | PASS | lint, typecheck, build, 27 test files / 89 tests, structure check, docs check |
| `pnpm workflow:check` | PASS | workflow guard passed |
| `pnpm sinan:contract:check` | PASS | Sinan handoff contract guard passed |
| `pnpm gamepad:harness:check` | PASS | manual Gamepad harness guard passed |
| `pnpm browser:test` | PASS | Chromium 15/15 Playwright tests passed |
| `pnpm browser:test:all` | PASS | Chromium, Firefox, WebKit 45/45 Playwright tests passed |
| `pnpm release:dry-run` | PASS | Chromium browser smoke plus package dry-run completed |
| `pnpm package:dry-run` | PASS | four workspace packages completed `npm pack --dry-run` |

## Package Dry-Run Snapshot

| Package | Version | Tarball | Package size | Unpacked size | Files |
|---|---:|---|---:|---:|---:|
| `@inputflow/core` | `0.0.0` | `inputflow-core-0.0.0.tgz` | 23.0 kB | 117.0 kB | 73 |
| `@inputflow/schema` | `0.0.0` | `inputflow-schema-0.0.0.tgz` | 6.9 kB | 47.8 kB | 21 |
| `@inputflow/testing` | `0.0.0` | `inputflow-testing-0.0.0.tgz` | 7.8 kB | 36.2 kB | 25 |
| `@inputflow/browser` | `0.0.0` | `inputflow-browser-0.0.0.tgz` | 6.8 kB | 33.1 kB | 21 |

## Non-Blocking Local Warnings

- Playwright emitted repeated `NO_COLOR` versus `FORCE_COLOR` warnings. The
  browser tests still completed successfully.
- npm emitted unknown environment config warnings for
  `verify-deps-before-run` and `_jsr-registry` during `npm pack --dry-run`.
  The dry-run completed successfully and did not publish.

## Release Boundaries Preserved

This local evidence does not claim:

- npm publish success,
- GitHub Release creation,
- git tag creation,
- npm authentication, 2FA, registry permission, or provenance signing,
- owner approval for license, version, dist-tag, or publish access,
- physical Gamepad hardware acceptance,
- downstream Sinan adapter acceptance.

Phase 10 remains `HARNESS_READY_NO_HARDWARE`.
Phase 11 remains `HANDOFF_READY_BLOCKED_DOWNSTREAM`.
