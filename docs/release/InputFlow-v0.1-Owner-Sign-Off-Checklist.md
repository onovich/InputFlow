# InputFlow v0.1 Owner Sign-Off Checklist

Date: 2026-06-22
Status: Deferral direction recorded; no real release authorized by this checklist.

## Use

This checklist now has two layers:

- Phase 13 deferral direction already recorded by the owner,
- future real-release sign-off fields that remain incomplete and unauthorized.

The recorded deferral direction is enough to keep the release candidate
decision packet current. It is not enough to publish, tag, create a GitHub
Release, change package metadata, or choose the final public license.

## Outcome

| Decision | Owner selection |
|---|---|
| Authorize v0.1 release in a separate release execution step | Not selected |
| Defer v0.1 release pending named blockers | Selected in Phase 13: `DEFERRED_RELEASE_DECISION` |
| Decline v0.1 release from this candidate |  |

## Recorded Phase 13 Direction

| Field | Recorded value |
|---|---|
| Decision date | 2026-06-22 |
| Deferral record | `docs/release/InputFlow-v0.1-Owner-Decision-Record.md` |
| Release status | `RELEASE_DEFERRED_DECISION_RECORDED` |
| Future RC version inclination | `0.1.0-rc.0`; package metadata remains `0.0.0` |
| Future npm access inclination | Public package; no `publishConfig` or registry metadata changed |
| Future npm dist-tag inclination | `next`; no publish or dist-tag operation authorized |
| Public license | `STILL_BLOCKED_EXACT_LICENSE` |
| Release actor | Owner retains sign-off authority; executor acts only after later approval |
| Rollback/deprecate execution | Owner approval required before executor action |
| Phase 10 `HARNESS_READY_NO_HARDWARE` accepted for RC? | Yes, as RC known limit only; no physical Gamepad PASS claimed |
| Phase 11 `HANDOFF_READY_BLOCKED_DOWNSTREAM` accepted for RC? | Yes, as RC known limit only; no downstream Sinan adapter acceptance claimed |

## Future Real-Release Sign-Off Fields

The owner must complete these fields before any real release execution:

| Field | Owner entry |
|---|---|
| Owner name / role |  |
| Real release decision date |  |
| Exact public license decision |  |
| Final version decision and metadata change approval |  |
| Git tag decision and tag creation approval |  |
| npm package access and registry policy |  |
| npm dist-tag operation |  |
| Publish owner / release executor |  |
| Provenance policy |  |
| Release notes approver |  |
| Rollback/deprecate authority |  |
| Phase 10 limitation still accepted for release scope? |  |
| Phase 11 limitation still accepted for release scope? |  |
| Final release commit or SHA range |  |

## Required Evidence Review

| Evidence | Reviewed by owner? |
|---|---|
| `docs/release/InputFlow-v0.1-Owner-Decision-Record.md` | Recorded for Phase 13 deferral |
| `docs/release/InputFlow-v0.1-Release-Authorization-Packet.md` |  |
| `docs/release/InputFlow-v0.1-Owner-Decision-Matrix.md` |  |
| `docs/release/InputFlow-v0.1-Remote-CI-Evidence.md` |  |
| `docs/release/InputFlow-v0.1-Local-Release-Confidence.md` |  |
| `docs/release/InputFlow-v0.1-Package-Metadata-Audit.md` |  |
| `docs/release/InputFlow-v0.1-Publish-Simulation-and-Provenance.md` |  |
| `docs/release/InputFlow-v0.1-Rollback-and-Deprecation-Policy.md` |  |
| `docs/release/InputFlow-v0.1-Final-Release-Candidate-Audit.md` |  |

## Release Execution Reminder

If the owner later authorizes release, release execution must happen in a
separate owner-approved step. Phase 13 does not run:

- `npm publish`,
- GitHub Release creation,
- git tag creation,
- package version, license, `publishConfig`, registry, dist-tag, or provenance
  configuration changes,
- secret or token changes,
- downstream Sinan adapter implementation,
- physical Gamepad lab acceptance.

The Phase 12 status remains part of the evidence trail:

```txt
AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS
```

The Phase 13 applied owner direction is:

```txt
RELEASE_DEFERRED_DECISION_RECORDED
```
