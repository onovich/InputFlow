# InputFlow v0.1 Publish Simulation and Provenance Notes

Date: 2026-06-22
Status: Publish simulation evidence ready; real publish remains blocked on owner
authorization.

## Purpose

This document separates what the Phase 12 dry-runs prove from what only a real
owner-approved publish can prove.

InputFlow v0.1 has local and remote non-publishing evidence, but Phase 12 must
not run `npm publish`, create a GitHub Release, or create a git tag.

## Simulation Evidence

| Evidence | Command or workflow | Result | What it proves |
|---|---|---|---|
| Local package dry-run | `pnpm package:dry-run` | PASS | each workspace package can run `npm pack --dry-run` from built `dist` output |
| Local release dry-run | `pnpm release:dry-run` | PASS | Chromium browser smoke and package dry-run complete together |
| Remote release dry-run | GitHub Actions run `27958498216` | PASS | Ubuntu CI can build packages, install Chromium, and run `pnpm release:dry-run` |
| Metadata audit | `pnpm package:metadata:check` | PASS | manifests keep the current package names, versions, license values, exports, and files allowlist |

## What Simulation Does Not Prove

The dry-runs do not prove:

- npm account ownership or organization permissions,
- token, trusted publishing, 2FA, or account policy readiness,
- public package access level,
- dist-tag choice,
- package provenance publication,
- final package visibility on npm,
- ability to rollback, unpublish, or deprecate a published version,
- legal approval for license text,
- semver approval for a public v0.1 version.

## Provenance Decision Point

The owner must decide whether the eventual release should use npm provenance.
Relevant npm documentation:

- `https://docs.npmjs.com/generating-provenance-statements/`
- `https://docs.npmjs.com/trusted-publishers/`
- `https://docs.npmjs.com/viewing-package-provenance/`

Current repository state has no `publishConfig.provenance` decision and no
trusted publishing policy committed for release. Phase 12 therefore treats
provenance as an owner decision, not as an implicit default.

## Access and Dist-Tag Decision Point

The packages are scoped as `@inputflow/*`. Before a real public release, the
owner must explicitly choose:

- public or private npm access,
- the dist-tag for the first v0.1 release,
- the npm account or organization that owns publication,
- whether to publish from a local maintainer machine or from CI trusted
  publishing.

For scoped public packages, npm documents `npm publish --access public`; Phase
12 intentionally does not run it.

Reference: `https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/`

## Recommended Authorization Gate

Before any real publish step, require a written owner decision that names:

- final package version,
- git tag name,
- npm package access,
- npm dist-tag,
- publish actor or CI workflow,
- provenance policy,
- release notes approval,
- rollback/deprecate owner.

Without those decisions, the expected Phase 12 status remains
`AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS`.
