# InputFlow v0.1 Owner Decision Record

Date: 2026-06-22
Status: `RELEASE_DEFERRED_DECISION_RECORDED`

## Purpose

This record applies the owner direction after Phase 12:

- defer the real v0.1 release,
- record release-candidate-oriented decisions for future execution planning,
- keep all real release-changing steps blocked until a later owner-approved
  release execution step.

This file is not a package publish record, GitHub Release, git tag, license
decision, version change, package metadata change, physical Gamepad acceptance
record, or downstream Sinan adapter acceptance record.

## Owner Direction

The owner agreed with the planner recommendation to defer real release and
record RC-oriented decisions. The repository therefore keeps the release
authorization packet as a decision artifact, not as authorization to publish.

| Topic | Recorded decision | Execution meaning |
|---|---|---|
| Real v0.1 release now | `DEFERRED_RELEASE_DECISION` | No npm publish, GitHub Release, git tag, package metadata change, or secrets operation is authorized. |
| Future RC version direction | `0.1.0-rc.0` is the preferred future RC semver if release work resumes. | This is only a planning inclination; package versions remain unchanged. |
| Future npm publish access | Public package is the preferred future direction if release work resumes. | This is only a planning inclination; no `publishConfig`, registry, or access metadata is changed. |
| Future npm dist-tag | `next` is the preferred future dist-tag if release work resumes. | This is only a planning inclination; no publish command or dist-tag operation is authorized. |
| Public license | `STILL_BLOCKED_EXACT_LICENSE` | The owner must choose the exact public license before any public publish. The executor must not choose MIT, Apache-2.0, or another license by inference. |
| Release authority | Owner retains release sign-off authority. | A release executor may execute later only after explicit owner approval. |
| Phase 10 limitation | `ACCEPTED_FOR_RC_KNOWN_LIMIT`: `HARNESS_READY_NO_HARDWARE`. | The manual harness is acceptable for RC planning, but no physical Gamepad PASS is claimed. |
| Phase 11 limitation | `ACCEPTED_FOR_RC_KNOWN_LIMIT`: `HANDOFF_READY_BLOCKED_DOWNSTREAM`. | InputFlow-side handoff is acceptable for RC planning, but no downstream Sinan adapter acceptance is claimed. |
| Rollback / deprecation | `OWNER_APPROVAL_REQUIRED`. | A release executor may perform rollback or deprecation only after owner approval for a real release or incident response. |

## Future Real-Release Blockers

A future real release remains blocked until the owner explicitly decides or
authorizes:

- exact public license,
- final version and package metadata change,
- git tag name and tag creation,
- npm package access, registry policy, and dist-tag,
- publish owner or release executor,
- provenance policy,
- release notes sign-off,
- rollback and deprecation authority,
- whether current Phase 10 and Phase 11 limitations remain acceptable for the
  final release scope.

## Non-Scope Preserved

Phase 13 does not:

- run `npm publish`,
- create a GitHub Release,
- create or push a git tag,
- read or write secrets or tokens,
- change package version, license, `publishConfig`, registry, dist-tag, or
  provenance configuration,
- create `@inputflow/sinan`,
- modify downstream repositories,
- claim physical Gamepad acceptance,
- claim downstream Sinan adapter acceptance.
