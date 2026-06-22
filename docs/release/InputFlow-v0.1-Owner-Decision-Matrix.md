# InputFlow v0.1 Owner Decision Matrix

Date: 2026-06-22
Status: `RELEASE_DEFERRED_DECISION_RECORDED`; future real release still blocked

## Purpose

This matrix records the owner direction applied in Phase 13 and separates:

- decisions agreed for release-candidate planning,
- limitations accepted as RC known limits,
- items that still block any future real release.

Every release-changing action remains unauthorized until the owner approves a
separate release execution step.

## Decision Summary

| Decision | Current repository fact | Phase 13 owner direction | Status |
|---|---|---|---|
| Release outcome | No release has been run. | Defer real release and record RC-oriented decisions. | `DEFERRED_RELEASE_DECISION` |
| Public license | Package manifests currently use `UNLICENSED`. | Owner must choose the exact public license before public publish. | `STILL_BLOCKED_EXACT_LICENSE`; `BLOCKED_OWNER_DECISION` |
| Version | Workspace package versions are `0.0.0`. | If release work resumes, preferred RC semver is `0.1.0-rc.0`. | `DEFERRED_RELEASE_DECISION`; no package metadata change |
| Git tag | No v0.1 tag has been created. | Tag creation remains a future release execution decision. | `FUTURE_OWNER_SIGN_OFF_REQUIRED` |
| npm publish access | No `publishConfig` or access policy is set. | If release work resumes, preferred direction is public package. | `DEFERRED_RELEASE_DECISION`; no `publishConfig` change |
| npm dist-tag | No dist-tag decision exists. | If release work resumes, preferred direction is `next`. | `DEFERRED_RELEASE_DECISION`; no publish operation |
| npm publish owner | No publish owner is named. | Owner retains sign-off authority; a release executor may act later only after approval. | `FUTURE_OWNER_SIGN_OFF_REQUIRED` |
| Provenance | No provenance policy is authorized. | Owner must decide the exact policy before any publish. | `FUTURE_OWNER_DECISION_REQUIRED` |
| Release notes sign-off | Changelog is still a release-candidate draft. | Owner must sign final notes before any real release. | `FUTURE_OWNER_SIGN_OFF_REQUIRED` |
| Rollback/deprecate owner | No rollback owner is named. | Executor may perform rollback/deprecate only with owner approval. | `OWNER_APPROVAL_REQUIRED` |
| Phase 10 limitation | `HARNESS_READY_NO_HARDWARE`. | Accepted as an RC known limit only. | `ACCEPTED_FOR_RC_KNOWN_LIMIT`; no physical Gamepad PASS claimed |
| Phase 11 limitation | `HANDOFF_READY_BLOCKED_DOWNSTREAM`. | Accepted as an RC known limit only. | `ACCEPTED_FOR_RC_KNOWN_LIMIT`; no downstream Sinan adapter acceptance claimed |

## Release Authorization Outcomes

The owner selected the deferral outcome for Phase 13:

- `authorize-release`: proceed to a separate release execution step after all
  owner decisions are filled in and validated.
- `defer-release`: keep the authorization packet ready, but wait for named
  decisions or evidence. Phase 13 records this as
  `RELEASE_DEFERRED_DECISION_RECORDED`.
- `decline-release`: do not release v0.1 from the current candidate.

Phase 12 reported `AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS`. Phase 13 applies
the owner direction without authorizing publish, release, tag, or metadata
changes.

## Explicit Non-Decisions

The executor must not infer or write any of these as decided for a real release:

- exact license name,
- final package version metadata,
- git tag name or tag creation,
- npm registry,
- npm access configuration,
- dist-tag operation,
- provenance behavior,
- publish owner account,
- release note approver,
- rollback owner beyond owner-approved execution.

## Recorded Phase 13 Fields

These fields document the applied deferral direction. They do not authorize a
real release.

| Field | Recorded value |
|---|---|
| Release decision | `DEFERRED_RELEASE_DECISION` |
| License | `STILL_BLOCKED_EXACT_LICENSE` |
| Version direction | Future RC inclination: `0.1.0-rc.0`; package metadata unchanged |
| Tag | Future owner sign-off required |
| npm access / dist-tag direction | Future public package + `next` inclination; no publish configuration changed |
| Publish owner | Future owner sign-off required |
| Provenance decision | Future owner decision required |
| Release notes approver | Future owner sign-off required |
| Rollback/deprecate execution | Owner approval required before executor action |
| Phase 10 limitation accepted for RC? | Yes: `HARNESS_READY_NO_HARDWARE` as RC known limit only |
| Phase 11 limitation accepted for RC? | Yes: `HANDOFF_READY_BLOCKED_DOWNSTREAM` as RC known limit only |
| Decision record | `docs/release/InputFlow-v0.1-Owner-Decision-Record.md` |
