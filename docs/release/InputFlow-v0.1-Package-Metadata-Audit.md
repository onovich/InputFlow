# InputFlow v0.1 Package Metadata Audit

Date: 2026-06-22
Status: Phase 12 release authorization evidence
Commands:

```powershell
pnpm package:metadata:check
pnpm package:dry-run
```

## Summary

Package metadata and dry-run checks passed for the four workspace packages. No
license, version, publishConfig, registry, access, provenance, or dist-tag
settings were changed.

The audit result supports owner review. It is not a publish action.

## Package Metadata

| Package | Version | License | Main | Types | Files | Side effects | Runtime dependencies | Status |
|---|---|---|---|---|---|---|---|---|
| `@inputflow/core` | `0.0.0` | `UNLICENSED` | `./dist/index.js` | `./dist/index.d.ts` | `dist` | `false` | none | PASS, owner license/version decision pending |
| `@inputflow/schema` | `0.0.0` | `UNLICENSED` | `./dist/index.js` | `./dist/index.d.ts` | `dist` | `false` | `zod` | PASS, owner license/version decision pending |
| `@inputflow/testing` | `0.0.0` | `UNLICENSED` | `./dist/index.js` | `./dist/index.d.ts` | `dist` | `false` | `@inputflow/core: workspace:*` | PASS, owner license/version decision pending |
| `@inputflow/browser` | `0.0.0` | `UNLICENSED` | `./dist/index.js` | `./dist/index.d.ts` | `dist` | `false` | `@inputflow/core: workspace:*` | PASS, owner license/version decision pending |

All four packages expose:

```txt
exports["."].types = ./dist/index.d.ts
exports["."].default = ./dist/index.js
exports["./package.json"] = ./package.json
```

## Dry-Run Tarball Summary

| Package | Dry-run filename | Package size | Unpacked size | Files | Result |
|---|---|---:|---:|---:|---|
| `@inputflow/core` | `inputflow-core-0.0.0.tgz` | 23.0 kB | 117.0 kB | 73 | PASS |
| `@inputflow/schema` | `inputflow-schema-0.0.0.tgz` | 6.9 kB | 47.8 kB | 21 | PASS |
| `@inputflow/testing` | `inputflow-testing-0.0.0.tgz` | 7.8 kB | 36.2 kB | 25 | PASS |
| `@inputflow/browser` | `inputflow-browser-0.0.0.tgz` | 6.8 kB | 33.1 kB | 21 | PASS |

`@inputflow/testing` dry-run output includes the Sinan contract fixture build:

```txt
dist/sinan-adapter-contract.d.ts
dist/sinan-adapter-contract.d.ts.map
dist/sinan-adapter-contract.js
dist/sinan-adapter-contract.js.map
```

## Owner-Blocked Publish Prerequisites

The following are intentionally unresolved:

- public license,
- release version,
- npm access,
- dist-tag,
- registry/publishConfig policy,
- provenance policy,
- publish owner.

These unresolved items keep Phase 12 at
`AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS` unless the owner explicitly signs
them off in this phase.

## Non-Blocking Local Warnings

`npm pack --dry-run` emitted local npm config warnings:

- `Unknown env config "verify-deps-before-run"`
- `Unknown env config "_jsr-registry"`

The command still exited successfully. These warnings are environment config
warnings, not package-content failures.

## Non-Scope Confirmed

- No `npm publish` was executed.
- No package version or license was changed.
- No `publishConfig`, registry, dist-tag, access, token, or provenance setting
  was added.
- No GitHub Release or git tag was created.
