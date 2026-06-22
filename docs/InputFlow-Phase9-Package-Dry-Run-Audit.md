# InputFlow Phase 9 Package Dry-Run Audit

> Date: 2026-06-22
> Scope: v0.1 release candidate package tarball review

This audit records the local `pnpm package:dry-run` and `pnpm release:dry-run`
results used for Phase 9 v0.1 release candidate review. It is evidence only;
Phase 9 does not publish npm packages, create a GitHub Release, or create a git
tag.

## Commands

| Command | Result | Notes |
|---|---|---|
| `pnpm package:dry-run` | Passed | Runs `npm pack --dry-run` for `core`, `schema`, `testing`, and `browser`. |
| `pnpm release:dry-run` | Passed | Runs required Chromium browser smoke first, then package dry-run. |

The Round 11 `pnpm release:dry-run` browser gate passed 15 Chromium smoke tests.

## Tarball Summary

| Package | Dry-run filename | Package size | Unpacked size | Files | Content boundary | Audit result |
|---|---|---:|---:|---:|---|---|
| `@inputflow/core` | `inputflow-core-0.0.0.tgz` | 23.0 kB | 117.0 kB | 73 | `dist` runtime modules, interaction modules, declarations, maps, and `package.json`. | PASS |
| `@inputflow/schema` | `inputflow-schema-0.0.0.tgz` | 6.9 kB | 47.8 kB | 21 | `dist` schema, migration, override, replay trace modules, declarations, maps, and `package.json`. | PASS |
| `@inputflow/testing` | `inputflow-testing-0.0.0.tgz` | 7.3 kB | 29.0 kB | 25 | `dist` virtual source, fake clock, replay, action trace, Sinan contract fixture modules, declarations, maps, and `package.json`. | PASS |
| `@inputflow/browser` | `inputflow-browser-0.0.0.tgz` | 6.8 kB | 33.1 kB | 21 | `dist` event target, keyboard, pointer, wheel-through-pointer, gamepad modules, declarations, maps, and `package.json`. | PASS |

## Exclusion Review

The dry-run tarball manifests did not include:

- `src`, `test`, `tests`, or Playwright artifacts.
- repository docs, workflow files, local scripts, lockfiles, or tsbuildinfo files.
- generated `.tgz` package artifacts.
- secrets, environment files, or local machine paths.

The package boundary is therefore limited to built `dist` outputs and each
package manifest.

## Warning Classification

`npm pack --dry-run` prints two local npm environment warnings for each package:

- `Unknown env config "verify-deps-before-run"`
- `Unknown env config "_jsr-registry"`

These warnings are not package-content warnings. They come from local npm config,
are already documented in `docs/InputFlow-CI-Troubleshooting.md`, and did not
change the successful exit status of `pnpm package:dry-run` or
`pnpm release:dry-run`.

The local `pnpm release:dry-run` browser step can also print a Node warning that
`NO_COLOR` is ignored when `FORCE_COLOR` is set. This is a local terminal
environment warning, not a browser smoke failure.

## Result

Phase 9 Round 11 package dry-run audit is PASS. The v0.1 RC tarball content is
reviewable from this document and from the live `npm pack --dry-run` output, and
no publishing action was performed.
