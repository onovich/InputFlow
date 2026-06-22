# InputFlow v0.1 Remote CI Evidence

Date: 2026-06-22
Evidence capture method: GitHub CLI read-only run metadata, plus two
`workflow_dispatch` runs for non-publishing validation workflows.
Latest push CI evidence commit: `13e2551953e0c409b38b21ffeb958a3b9ce86e62`
Latest manual release evidence commit:
`8a796e86789cdd7629b972539ffc968f66841a48`
Status: Remote CI evidence refreshed for the Phase 12 authorization packet.

## Summary

The Phase 12 release authorization packet has current remote CI evidence for the
four workflows that matter before an owner can decide release/no-release/defer:

| Workflow | Trigger | Run | Head SHA | Conclusion |
|---|---|---|---|---|
| Validate | `push` | `27959896472` | `13e2551953e0c409b38b21ffeb958a3b9ce86e62` | success |
| Required Browser Smoke | `push` | `27959897277` | `13e2551953e0c409b38b21ffeb958a3b9ce86e62` | success |
| Release Dry Run | `workflow_dispatch` | `27958498216` | `8a796e86789cdd7629b972539ffc968f66841a48` | success |
| Optional Browser Matrix | `workflow_dispatch` | `27958499238` | `8a796e86789cdd7629b972539ffc968f66841a48` | success |

## Run Links

- Validate:
  `https://github.com/onovich/InputFlow/actions/runs/27959896472`
- Required Browser Smoke:
  `https://github.com/onovich/InputFlow/actions/runs/27959897277`
- Release Dry Run:
  `https://github.com/onovich/InputFlow/actions/runs/27958498216`
- Optional Browser Matrix:
  `https://github.com/onovich/InputFlow/actions/runs/27958499238`

## Job Evidence

| Workflow | Job | Job URL | Result |
|---|---|---|---|
| Validate | Validate | `https://github.com/onovich/InputFlow/actions/runs/27959896472/job/82738237846` | success |
| Required Browser Smoke | Chromium smoke | `https://github.com/onovich/InputFlow/actions/runs/27959897277/job/82738237733` | success |
| Release Dry Run | Release dry-run | `https://github.com/onovich/InputFlow/actions/runs/27958498216/job/82733238221` | success |
| Optional Browser Matrix | Optional browser matrix | `https://github.com/onovich/InputFlow/actions/runs/27958499238/job/82733241441` | success |

## Workflow Coverage

- Validate runs dependency install and `pnpm validate`.
- Required Browser Smoke builds packages, installs Chromium, and runs
  `pnpm browser:test`.
- Release Dry Run builds packages, installs Chromium, and runs
  `pnpm release:dry-run`.
- Optional Browser Matrix builds packages, installs Chromium, Firefox, and
  WebKit, then runs `pnpm browser:test:all`.

The two manual workflows were triggered only after confirming their workflow
files contain no `npm publish`, GitHub Release creation, or tag creation steps.

## Observed Remote Annotation

GitHub Actions emitted a Node.js 20 deprecation annotation for several reusable
actions while forcing those actions to run on Node.js 24. The workflows still
completed successfully. This annotation is maintenance signal for workflow
dependencies, not a release blocker by itself.

## Authorization Boundaries

This evidence does not authorize or prove:

- `npm publish`,
- GitHub Release creation,
- git tag creation,
- npm authentication, 2FA, provenance signing, or registry permission,
- public license approval,
- version or dist-tag approval,
- physical Gamepad hardware acceptance,
- downstream Sinan adapter acceptance.

Later Phase 12 documentation commits can move `main` after these evidence
commits. Before a real release action, the owner should either accept this
evidence as covering the release candidate code path or rerun the remote
workflows on the exact final release commit.
