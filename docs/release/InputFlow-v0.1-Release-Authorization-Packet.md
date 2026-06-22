# InputFlow v0.1 Release Authorization Packet

Date: 2026-06-22
Status: Owner deferral decision recorded; no real release authorized
Target branch: `main`
Latest remote evidence commit: `8a796e86789cdd7629b972539ffc968f66841a48`

## Purpose

This packet gives the repository owner enough evidence to choose one of:

- authorize a real v0.1 release in a later owner-approved step,
- decline release,
- defer release until named blockers are resolved.

This packet is not an npm publish record, GitHub Release, git tag, license
decision, version decision, or downstream acceptance record.

Phase 13 applies the owner direction to defer real release and record
RC-oriented decisions. The applied decision record is maintained in
`docs/release/InputFlow-v0.1-Owner-Decision-Record.md`.

## Current Release-Candidate State

| Area | Current state | Release authorization meaning |
|---|---|---|
| Phase 9 RC evidence | `RC_READY` for the earlier Phase 9 target commit. | Release-candidate evidence exists, but Phase 12 must refresh or record current remote evidence. |
| Phase 10 physical Gamepad | `HARNESS_READY_NO_HARDWARE`. | Manual harness is ready; no physical controller PASS may be claimed. |
| Phase 11 Sinan handoff | `HANDOFF_READY_BLOCKED_DOWNSTREAM`. | InputFlow-side handoff is ready; real Sinan adapter acceptance remains downstream. |
| Owner decision | `RELEASE_DEFERRED_DECISION_RECORDED`. | Real release is deferred; RC-oriented planning decisions are recorded without authorizing execution. |
| npm publish | Not performed. | Owner authorization is still required before any publish step. |
| GitHub Release | Not created. | Owner authorization is still required before creating a release. |
| git tag | Not created. | Owner authorization is still required before creating a tag. |
| License/version | Package manifests currently remain as-is. | Owner must decide public license, semver version, dist-tag, and publish access before release. |

## Owner Decision Blockers

The Phase 12 status remains part of the evidence trail:

```txt
AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS
```

Phase 13 records the applied owner direction:

```txt
RELEASE_DEFERRED_DECISION_RECORDED
```

Future real release remains blocked until the owner explicitly decides or
authorizes:

- exact public license,
- final release version and package metadata change,
- git tag name and tag creation,
- npm access, registry policy, and dist-tag operation,
- publish owner,
- provenance policy,
- release notes sign-off,
- rollback/deprecate owner,
- whether Phase 10 and Phase 11 limitations remain acceptable for the final
  release scope.

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

Owner sign-off checklist is maintained in
`docs/release/InputFlow-v0.1-Owner-Sign-Off-Checklist.md`.

Owner deferral decision record is maintained in
`docs/release/InputFlow-v0.1-Owner-Decision-Record.md`.

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
- Owner sign-off checklist: `docs/release/InputFlow-v0.1-Owner-Sign-Off-Checklist.md`
- Owner decision record: `docs/release/InputFlow-v0.1-Owner-Decision-Record.md`

## Non-Scope Confirmed

This packet and Phase 13 must not:

- run `npm publish`,
- create a GitHub Release,
- create or push a git tag,
- read or write secrets or tokens,
- change license, version, publishConfig, registry, dist-tag, provenance, or npm access strategy without explicit owner authorization,
- create `@inputflow/sinan`,
- modify downstream repositories,
- claim physical Gamepad acceptance,
- claim downstream Sinan adapter acceptance.

## Phase 13 Applied Decision

- Real release is deferred.
- Future RC planning inclination: `0.1.0-rc.0`.
- Future npm planning inclination: public package with `next` dist-tag.
- Phase 10 `HARNESS_READY_NO_HARDWARE` is accepted only as an RC known limit.
- Phase 11 `HANDOFF_READY_BLOCKED_DOWNSTREAM` is accepted only as an RC known
  limit.
- Exact public license remains `STILL_BLOCKED_EXACT_LICENSE`.
- Rollback/deprecate execution requires owner approval before executor action.

## Future Release Work Remaining

- Owner chooses exact public license before any public publish.
- Owner approves final version, tag, npm access, registry policy, dist-tag,
  provenance, release notes, and publish executor.
- Owner reconfirms whether Phase 10 and Phase 11 limitations remain acceptable
  for the final release scope.
- Executor runs release execution only in a later owner-approved step.
