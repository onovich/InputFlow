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

## Latest Execution Setup

| Field | Value |
|---|---|
| Tester | Codex executor |
| Date / time | 2026-06-22 17:30 +08:00 |
| Operating system | Windows local Codex workspace |
| Browser and version | Physical browser checks not executed with real hardware |
| Controller model | No physical controller available to this executor environment |
| Connection type | Not available |
| InputFlow commit | `d440b0d7821d65d35fdc80f96f08069a19550f0c` |
| Harness URL | `http://127.0.0.1:4173/examples/manual-gamepad-harness/index.html` |
| Baseline commands | `pnpm validate`, `pnpm browser:test`, `pnpm browser:test:all` |
| Artifact | Evidence row below; no physical screenshot or copied log exists |

## Browser / Controller Matrix

| Browser | Controller | Connection | Commit | South button | Left stick | Disconnect reset | Reconnect | Result | Notes / artifact |
|---|---|---|---|---|---|---|---|---|---|
| Chromium / Chrome | No physical controller available | USB | `a654e25807c884f61a493c4d9f6f78e9602d8bbf` | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | Round 6 could not observe real hardware in the executor environment. Automated Chromium fixture remains separate baseline evidence. |
| Chromium / Chrome |  | Bluetooth |  | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED |  |  |
| Firefox | No physical controller available | USB | `f9b06d0cd17a37cf9b992eef60c3e179ff87b7d2` | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | Round 7 could not observe real hardware in the executor environment. Cross-browser automated fixtures remain separate baseline evidence. |
| Firefox |  | Bluetooth |  | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED |  |  |
| WebKit / Safari | No physical controller available | USB | `d440b0d7821d65d35fdc80f96f08069a19550f0c` | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | Round 8 could not observe real hardware in the executor environment. WebKit automated fixture coverage remains separate baseline evidence. |
| WebKit / Safari |  | Bluetooth |  | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED | PASS / FAIL / SKIP / BLOCKED |  |  |

## Current Phase 10 Execution Notes

Round 6 Chromium / Chrome physical check was blocked because the executor
environment has no available physical controller. Round 7 Firefox physical check
and Round 8 WebKit / Safari physical check were blocked for the same reason. No
South button, left stick, disconnect reset, or reconnect behavior was observed
with real hardware.

Until a tester supplies real controller and browser observations, Phase 10 must
not report `HARDWARE_ACCEPTED`. If the harness and automated baseline remain
healthy, the likely final status is `HARNESS_READY_NO_HARDWARE`.

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
