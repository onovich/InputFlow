# InputFlow v0.1 Owner Sign-Off Checklist

Date: 2026-06-22
Status: Awaiting owner decision; no release authorized by this checklist.

## Use

The owner should complete this checklist only after reviewing the Phase 12
release authorization packet and its supporting evidence. Exactly one release
outcome should be selected.

## Outcome

| Decision | Owner selection |
|---|---|
| Authorize v0.1 release in a separate release execution step |  |
| Defer v0.1 release pending named blockers |  |
| Decline v0.1 release from this candidate |  |

## Required Owner Fields

| Field | Owner entry |
|---|---|
| Owner name / role |  |
| Decision date |  |
| Public license decision |  |
| Version decision |  |
| Git tag decision |  |
| npm package access |  |
| npm dist-tag |  |
| Publish owner / actor |  |
| Provenance policy |  |
| Release notes approver |  |
| Rollback/deprecate owner |  |
| Phase 10 `HARNESS_READY_NO_HARDWARE` accepted? |  |
| Phase 11 `HANDOFF_READY_BLOCKED_DOWNSTREAM` accepted? |  |
| Final release commit or SHA range |  |

## Required Evidence Review

| Evidence | Reviewed by owner? |
|---|---|
| `docs/release/InputFlow-v0.1-Release-Authorization-Packet.md` |  |
| `docs/release/InputFlow-v0.1-Owner-Decision-Matrix.md` |  |
| `docs/release/InputFlow-v0.1-Remote-CI-Evidence.md` |  |
| `docs/release/InputFlow-v0.1-Local-Release-Confidence.md` |  |
| `docs/release/InputFlow-v0.1-Package-Metadata-Audit.md` |  |
| `docs/release/InputFlow-v0.1-Publish-Simulation-and-Provenance.md` |  |
| `docs/release/InputFlow-v0.1-Rollback-and-Deprecation-Policy.md` |  |
| `docs/release/InputFlow-v0.1-Final-Release-Candidate-Audit.md` |  |

## Release Execution Reminder

If the owner authorizes release, release execution must happen in a separate
owner-approved step. Phase 12 does not run:

- `npm publish`,
- GitHub Release creation,
- git tag creation,
- secret or token changes,
- downstream Sinan adapter implementation,
- physical Gamepad lab acceptance.

Until the owner fills this checklist, the expected Phase 12 status remains:

```txt
AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS
```
