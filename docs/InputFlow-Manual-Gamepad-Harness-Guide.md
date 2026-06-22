# InputFlow Manual Gamepad Harness Guide

> Date: 2026-06-22
> Scope: Phase 10 physical Gamepad manual release-confidence harness

This guide defines the local manual harness that Phase 10 uses for physical
controller evidence. The harness is a reviewer tool, not an automated CI gate.
It complements `docs/InputFlow-Manual-Gamepad-Release-Checklist.md`.

## Harness Location

The harness entry point is:

```txt
examples/manual-gamepad-harness/index.html
```

The local launcher is:

```txt
pnpm gamepad:harness
```

The launcher serves the repository root with a small Node static server and
prints a localhost URL for the harness. It does not publish packages, create a
release, require secrets, or mutate build output.

## Dependency Boundary

The harness imports built package output through public package entry points:

```txt
@inputflow/core    -> packages/core/dist/index.js
@inputflow/browser -> packages/browser/dist/index.js
```

Before opening the harness, run:

```powershell
pnpm validate
pnpm build
```

`pnpm validate` already runs `pnpm build`; the explicit build command is useful
only when a tester wants a narrower refresh before reopening the page.

The harness must remain in `examples/`, `docs/`, or test tooling. It must not
introduce DOM, browser, Playwright, GitHub Actions, release tooling, or manual
hardware dependencies into `@inputflow/core`.

## Display Contract

The harness should show the minimum physical Gamepad acceptance state:

- Browser Gamepad API support.
- Number of visible gamepad slots and the selected slot index.
- Raw physical gamepad id, connected flag, mapping, button count, and axis
  count when the browser exposes them.
- InputFlow South button action state:
  - value
  - `isPressed`
  - `justPressed`
  - `justReleased`
- InputFlow left stick action state:
  - x
  - y
  - magnitude
  - neutral / non-neutral state
- Disconnect and reconnect observations.
- Timestamped event log that testers can copy into evidence notes.

The harness should display an explicit empty state when `navigator.getGamepads`
is unavailable or no controller is visible. Empty state is not failure by
itself; it is evidence that the browser / operating system / controller setup
needs manual attention.

## Manual Test Flow

For each browser / controller / connection pair:

1. Run `pnpm validate`.
2. Run `pnpm gamepad:harness`.
3. Open the printed localhost URL in the target browser.
4. Connect the controller.
5. Press a controller button once if the browser requires user activation
   before exposing Gamepads.
6. Confirm the harness shows a connected gamepad slot.
7. Press and release the South button.
8. Move the left stick through x and y directions, then release to neutral.
9. Disconnect the controller and observe neutral reset.
10. Reconnect the controller and repeat the South button and left stick checks.
11. Copy the event log or capture a screenshot.
12. Record the result in
    `docs/InputFlow-Phase10-Physical-Gamepad-Evidence.md`.

## Result Classification

Use these result values in evidence:

- `PASS`: real controller evidence satisfies the manual checklist for that
  browser / controller / connection pair.
- `FAIL`: the browser exposes the device but mapping, neutral reset,
  disconnect reset, or reconnect behavior fails.
- `SKIP`: the browser, controller model, or connection type is intentionally
  not available in this test pass.
- `BLOCKED`: the tester cannot determine a result because hardware, browser
  permission, OS pairing, or harness loading is blocked.

Automated Playwright gamepad smoke can support release confidence, but it must
not be recorded as physical controller `PASS`.
