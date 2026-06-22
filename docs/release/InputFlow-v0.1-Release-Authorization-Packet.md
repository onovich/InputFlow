# InputFlow v0.1 Release Authorization Packet

Date: 2026-06-22
Status: Draft owner decision packet
Target branch: `main`
Latest remote evidence commit: `8a796e86789cdd7629b972539ffc968f66841a48`

## Purpose

This packet gives the repository owner enough evidence to choose one of:

- authorize a real v0.1 release in a later owner-approved step,
- decline release,
- defer release until named blockers are resolved.

This packet is not an npm publish record, GitHub Release, git tag, license
decision, version decision, or downstream acceptance record.

## Current Release-Candidate State

| Area | Current state | Release authorization meaning |
|---|---|---|
| Phase 9 RC evidence | `RC_READY` for the earlier Phase 9 target commit. | Release-candidate evidence exists, but Phase 12 must refresh or record current remote evidence. |
| Phase 10 physical Gamepad | `HARNESS_READY_NO_HARDWARE`. | Manual harness is ready; no physical controller PASS may be claimed. |
| Phase 11 Sinan handoff | `HANDOFF_READY_BLOCKED_DOWNSTREAM`. | InputFlow-side handoff is ready; real Sinan adapter acceptance remains downstream. |
| npm publish | Not performed. | Owner authorization is still required before any publish step. |
| GitHub Release | Not created. | Owner authorization is still required before creating a release. |
| git tag | Not created. | Owner authorization is still required before creating a tag. |
| License/version | Package manifests currently remain as-is. | Owner must decide public license, semver version, dist-tag, and publish access before release. |

## Owner Decision Blockers

The default Phase 12 status is expected to remain:

```txt
AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS
```

until the owner explicitly decides:

- public license,
- release version,
- git tag name,
- npm access and dist-tag,
- publish owner,
- release notes sign-off,
- rollback/deprecate owner,
- whether Phase 10 and Phase 11 limitations are acceptable for v0.1.

The detailed matrix is maintained in
`docs/release/InputFlow-v0.1-Owner-Decision-Matrix.md`.

Package metadata and dry-run evidence is maintained in
`docs/release/InputFlow-v0.1-Package-Metadata-Audit.md`.

Remote CI evidence is maintained in
`docs/release/InputFlow-v0.1-Remote-CI-Evidence.md`.

Local release confidence evidence is maintained in
`docs/release/InputFlow-v0.1-Local-Release-Confidence.md`.

Publish simulation and provenance notes are maintained in
`docs/release/InputFlow-v0.1-Publish-Simulation-and-Provenance.md`.

Rollback and deprecation policy is maintained in
`docs/release/InputFlow-v0.1-Rollback-and-Deprecation-Policy.md`.

Final release candidate audit is maintained in
`docs/release/InputFlow-v0.1-Final-Release-Candidate-Audit.md`.

## Evidence Entry Points

- Phase 9 final report: `docs/InputFlow-Phase9-Final-Report.md`
- Phase 9 remote CI evidence: `docs/InputFlow-Phase9-Remote-CI-Evidence.md`
- Phase 9 package dry-run audit: `docs/InputFlow-Phase9-Package-Dry-Run-Audit.md`
- Phase 10 final report: `docs/InputFlow-Phase10-Final-Report.md`
- Phase 10 physical Gamepad evidence: `docs/InputFlow-Phase10-Physical-Gamepad-Evidence.md`
- Phase 11 final report: `docs/InputFlow-Phase11-Final-Report.md`
- Phase 11 Sinan handoff packet: `docs/sinan-cooperation/inputflow-sinan-handoff-packet.md`
- Package metadata audit: `docs/release/InputFlow-v0.1-Package-Metadata-Audit.md`
- Remote CI evidence: `docs/release/InputFlow-v0.1-Remote-CI-Evidence.md`
- Local release confidence: `docs/release/InputFlow-v0.1-Local-Release-Confidence.md`
- Publish simulation and provenance notes: `docs/release/InputFlow-v0.1-Publish-Simulation-and-Provenance.md`
- Rollback and deprecation policy: `docs/release/InputFlow-v0.1-Rollback-and-Deprecation-Policy.md`
- Final release candidate audit: `docs/release/InputFlow-v0.1-Final-Release-Candidate-Audit.md`

## Non-Scope Confirmed

Phase 12 must not:

- run `npm publish`,
- create a GitHub Release,
- create or push a git tag,
- read or write secrets or tokens,
- change license, version, publishConfig, registry, provenance, or npm access strategy without explicit owner authorization,
- create `@inputflow/sinan`,
- modify downstream repositories,
- claim physical Gamepad acceptance,
- claim downstream Sinan adapter acceptance.

## Phase 12 Work Remaining

- Keep owner decision matrix pending until explicit owner sign-off.
- Keep remote CI evidence current before owner sign-off.
- Keep package metadata audit current before owner sign-off.
- Keep publish simulation and provenance notes current before owner sign-off.
- Keep rollback/deprecate policy pending owner sign-off.
- Add `pnpm release:authorization:check`.
- Sync README, CHANGELOG, development plan, and docs guard.
- Produce `docs/InputFlow-Phase12-Final-Report.md`.
