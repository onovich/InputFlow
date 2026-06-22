# InputFlow Phase 10 Physical Gamepad Evidence

> Date: 2026-06-22
> Scope: Phase 10 physical Gamepad manual release-confidence evidence

This document records physical controller evidence for the v0.1 release
candidate review. Automated browser Gamepad fixture results may be referenced as
baseline confidence, but they do not count as physical controller PASS.

## Evidence Rules

- Record one row for each browser / controller / connection pair.
- Use the manual harness from
  `docs/InputFlow-Manual-Gamepad-Harness-Guide.md`.
- Record the exact InputFlow commit tested.
- Do not mark a row `PASS` unless a real physical controller was observed in
  the target browser.
- Use `SKIP` for deliberately unavailable browser, controller, or connection
  combinations.
- Use `BLOCKED` when the tester cannot determine a result because hardware,
  browser permission, operating-system pairing, or harness loading is blocked.

## Result Values

| Result | Meaning |
|---|---|
| `PASS` | Real controller evidence satisfies South button, left stick, neutral reset, disconnect reset, and reconnect checks. |
| `FAIL` | The controller is visible, but mapping, neutral reset, disconnect reset, or reconnect behavior fails. |
| `SKIP` | The test combination was intentionally not available in this pass. |
| `BLOCKED` | A real environmental or harness blocker prevents a trustworthy result. |

## Setup Template

| Field | Value |
|---|---|
| Tester |  |
| Date / time |  |
| Operating system |  |
| Browser and version |  |
| Controller model |  |
| Connection type | USB / Bluetooth / other |
| InputFlow commit |  |
| Harness URL | `http://127.0.0.1:4173/examples/manual-gamepad-harness/index.html` |
| Baseline commands | `pnpm validate`, `pnpm browser:test` |
| Artifact | screenshot / copied log / notes |

## Browser / Controller Matrix

| Browser | Controller | Connection | Commit | South button | Left stick | Disconnect reset | Reconnect | Result | Notes / artifact |
|---|---|---|---|---|---|---|---|---|---|
| Chromium / Chrome |  | USB |  | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED |  |  |
| Chromium / Chrome |  | Bluetooth |  | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED |  |  |
| Firefox |  | USB |  | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED |  |  |
| Firefox |  | Bluetooth |  | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED |  |  |
| WebKit / Safari |  | USB |  | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED |  |  |
| WebKit / Safari |  | Bluetooth |  | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED |  |  |

## Current Phase 10 Execution Notes

No physical controller evidence has been recorded yet in this execution pass.
Until a tester supplies real controller and browser observations, Phase 10 must
not report `HARDWARE_ACCEPTED`.

## Automated Baseline References

Use these commands to prove the automated browser Gamepad fixture and package
baseline remain healthy:

```powershell
pnpm validate
pnpm browser:test
pnpm browser:test:all
pnpm release:dry-run
```

These commands are not physical hardware evidence.
