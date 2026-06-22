# InputFlow v0.1 Owner Decision Matrix

Date: 2026-06-22
Status: Owner decisions pending

## Purpose

This matrix lists decisions the owner must make before any real v0.1 release
action. It may recommend low-risk defaults, but every release-changing item
remains unauthorized until the owner explicitly approves it.

## Decision Summary

| Decision | Current repository fact | Recommendation | Default status |
|---|---|---|---|
| Public license | Package manifests currently use `UNLICENSED`. | Owner chooses a license before public publish. | BLOCKED_OWNER_DECISION |
| Version | Workspace package versions are `0.0.0`. | Owner chooses a v0.1 semver such as `0.1.0` or a prerelease. | BLOCKED_OWNER_DECISION |
| Git tag | No v0.1 tag has been created. | Owner chooses tag name after version decision. | BLOCKED_OWNER_DECISION |
| npm publish access | No `publishConfig` or access policy is set. | Owner chooses public/private access and registry policy. | BLOCKED_OWNER_DECISION |
| npm dist-tag | No dist-tag decision exists. | Owner chooses `latest`, `next`, or another explicit tag. | BLOCKED_OWNER_DECISION |
| npm publish owner | No publish owner is named. | Owner assigns an account or release manager with npm permissions. | BLOCKED_OWNER_DECISION |
| Provenance | No provenance policy is authorized. | Owner chooses whether to require npm provenance and how it is produced. | BLOCKED_OWNER_DECISION |
| Release notes sign-off | Changelog is still a release-candidate draft. | Owner signs release notes after final version/license decisions. | BLOCKED_OWNER_DECISION |
| Rollback/deprecate owner | No rollback owner is named. | Owner names who can deprecate, unpublish if allowed, or publish fixes. | BLOCKED_OWNER_DECISION |
| Phase 10 limitation | `HARNESS_READY_NO_HARDWARE`. | Owner decides whether no physical Gamepad PASS is acceptable. | BLOCKED_OWNER_DECISION |
| Phase 11 limitation | `HANDOFF_READY_BLOCKED_DOWNSTREAM`. | Owner decides whether downstream Sinan adapter absence is acceptable. | BLOCKED_OWNER_DECISION |

## Release Authorization Outcomes

The owner should select exactly one outcome:

- `authorize-release`: proceed to a separate release execution step after all
  owner decisions are filled in and validated.
- `defer-release`: keep the authorization packet ready, but wait for named
  decisions or evidence.
- `decline-release`: do not release v0.1 from the current candidate.

Phase 12 itself should report `AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS` while
any matrix row remains undecided.

## Explicit Non-Decisions

The executor must not infer or write any of these as decided:

- license name,
- version number,
- git tag,
- npm registry,
- npm access,
- dist-tag,
- provenance behavior,
- owner account,
- release note approver,
- rollback owner.

## Sign-Off Fields

These fields are intentionally blank until owner sign-off:

| Field | Owner entry |
|---|---|
| Release decision |  |
| License |  |
| Version |  |
| Tag |  |
| npm access / dist-tag |  |
| Publish owner |  |
| Provenance decision |  |
| Release notes approver |  |
| Rollback owner |  |
| Phase 10 limitation accepted? |  |
| Phase 11 limitation accepted? |  |
| Sign-off date |  |
