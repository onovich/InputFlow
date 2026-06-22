# InputFlow Sinan Handoff Packet

Date: 2026-06-22
Status: Phase 11 handoff packet
Audience: Sinan downstream adapter implementer and InputFlow checker

## Summary

This packet collects the InputFlow-side assets for a future Sinan adapter POC. It is ready for downstream implementation work in the Sinan repository, but it is not evidence that a real Sinan adapter has already been implemented or accepted.

Expected Phase 11 status when this packet is validated in InputFlow only:

```txt
HANDOFF_READY_BLOCKED_DOWNSTREAM
```

The downstream blocker is not an InputFlow repository defect. It means the actual Sinan repository adapter, screenshots/logs, and acceptance packet still need to be produced by the downstream owner.

## Handoff Assets

| Asset | Path | Purpose |
|---|---|---|
| Adapter contract | `docs/sinan-cooperation/inputflow-sinan-adapter-contract.md` | Describes the generic InputFlow/Sinan adapter boundary. |
| Handoff strategy | `docs/sinan-cooperation/inputflow-sinan-poc-handoff-strategy.md` | Defines InputFlow deliverables, downstream deliverables, and non-claim boundaries. |
| Fixture inventory | `docs/sinan-cooperation/inputflow-sinan-contract-fixture-inventory.md` | Lists current fixture exports, coverage, and gaps. |
| Blur/reset scenario | `docs/sinan-cooperation/inputflow-sinan-blur-reset-scenario.md` | Captures browser-source reset behavior for downstream validation. |
| Diagnostics handoff | `docs/sinan-cooperation/inputflow-sinan-diagnostics-handoff.md` | Defines diagnostic fields and downstream logging/reporting expectations. |
| Downstream checklist | `docs/sinan-cooperation/inputflow-sinan-downstream-acceptance-checklist.md` | Lists required downstream evidence and status values. |
| Package export audit | `docs/sinan-cooperation/inputflow-sinan-package-export-audit.md` | Confirms dry-run export surface and absence of a Sinan adapter package. |
| API examples | `docs/InputFlow-v0.1-API-Examples.md` | Shows public fixture and replay usage. |

## Fixture Surface

The handoff fixture is exported by `@inputflow/testing`:

```ts
import {
  createSinanGateAdapterContractFixture,
  runSinanGateAdapterContractReplay,
  sinanGateActionIds,
  sinanGateMapIds
} from "@inputflow/testing";
```

Required fixture traces:

- `keyboardInteract`
- `pointerInteract`
- `gamepadInteract`
- `editorSelect`
- `modalBlocksGameplay`
- `pauseBlocksGameplay`
- `pauseReleaseRestoresGameplay`

Required action ids:

- `runtime.gameplay.interact`
- `editor.viewport.select`
- `runtime.pause.confirm`
- `ui.modal.confirm`

## InputFlow Verification Command

The dedicated handoff guard is:

```powershell
pnpm sinan:contract:check
```

It verifies only InputFlow repository facts:

- Required handoff docs exist.
- README, API examples, development plan, and docs guard link the handoff entrypoints.
- The Sinan fixture exports expected actions, maps, traces, and tests.
- `@inputflow/testing` exports the fixture helpers.
- `packages/core` remains free of DOM, React, Three, browser runtime, Playwright, and Sinan host dependencies.
- The repository does not create `packages/sinan` or an `@inputflow/sinan` package.

## Suggested Downstream Flow

1. Consume the InputFlow packages or workspace build from a pinned InputFlow commit.
2. Implement the adapter in the Sinan repository, not in this repository.
3. Map Sinan input surfaces to the generic InputFlow maps and context leases.
4. Run the fixture traces through the downstream adapter.
5. Capture diagnostics using `docs/sinan-cooperation/inputflow-sinan-diagnostics-handoff.md`.
6. Fill out the downstream checklist with commands, screenshots/logs, commits, and unsupported risks.
7. Return the packet to the InputFlow checker for downstream acceptance review.

## Known Limits

- No `@inputflow/sinan` package is created here.
- No Sinan repository files are modified here.
- No npm publish, GitHub Release, or git tag is performed by Phase 11.
- No physical Gamepad acceptance is claimed without real controller/browser evidence.
- No Sinan EngineMode, World, EventSystem, Three picking, final action namespace, or final context priority policy is defined by InputFlow.

## InputFlow-Side Validation

Before handing this packet downstream, rerun:

```powershell
git diff --check
pnpm sinan:contract:check
pnpm docs:check
pnpm structure:check
pnpm validate
pnpm package:dry-run
```

Browser and release dry-run commands are covered by the final Phase 11 validation matrix, not by this packet alone.
