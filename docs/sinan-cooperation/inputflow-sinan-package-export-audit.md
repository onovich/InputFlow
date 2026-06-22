# InputFlow Sinan Package Export Audit

Date: 2026-06-22
Status: Phase 11 package dry-run evidence
Command: `pnpm package:dry-run`

## Purpose

This audit records the package/export evidence needed by the Sinan adapter POC handoff. It confirms that the InputFlow-side testing contract is included in package dry-run output while no Sinan adapter package is created by this repository.

## Dry-Run Result

`pnpm package:dry-run` completed successfully for:

- `@inputflow/core`
- `@inputflow/schema`
- `@inputflow/testing`
- `@inputflow/browser`

The local npm command emitted warnings for unknown environment config keys (`verify-deps-before-run` and `_jsr-registry`). The dry-run still exited successfully and produced npm pack summaries for all four workspace packages.

## Sinan Contract Export Evidence

The `@inputflow/testing` dry-run tarball includes:

```txt
dist/sinan-adapter-contract.d.ts
dist/sinan-adapter-contract.d.ts.map
dist/sinan-adapter-contract.js
dist/sinan-adapter-contract.js.map
```

`packages/testing/src/index.ts` exports:

```txt
createSinanGateAdapterContractFixture
runSinanGateAdapterContractReplay
sinanGateActionIds
sinanGateMapIds
SinanGateAdapterContractFixture
```

This is the intended v0.1 handoff surface for deterministic downstream Sinan adapter tests.

## Negative Export Evidence

This repository still does not produce:

- `@inputflow/sinan`
- `packages/sinan`
- a Sinan runtime adapter package
- a Sinan React diagnostics package
- a rebind UI package

Sinan integration remains a downstream adapter implementation task in the Sinan repository.

## Boundary Confirmation

Package dry-run keeps the same package ownership boundaries:

- `@inputflow/core` ships DOM-free runtime files and diagnostics.
- `@inputflow/schema` ships load-time schemas.
- `@inputflow/testing` ships virtual, replay, action trace, and Sinan contract fixture helpers.
- `@inputflow/browser` ships browser input sources.

No package dry-run output is evidence of real downstream Sinan adapter acceptance or physical Gamepad acceptance.

## Follow-Up Verification

The final Phase 11 matrix should rerun:

```powershell
pnpm sinan:contract:check
pnpm package:dry-run
```
