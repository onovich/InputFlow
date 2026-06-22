# InputFlow Manual Gamepad Release Checklist

> Date: 2026-06-22
> Scope: Phase 8 manual hardware release confidence

This checklist covers physical Gamepad verification that cannot be made a
stable automated CI gate in Phase 8.

Automated coverage still comes from the browser-level `navigator.getGamepads`
fixture in `pnpm browser:test` and `pnpm browser:test:all`. This checklist is a
manual release-confidence supplement, not an automated required gate.

## Required Setup

Record the exact setup before testing:

| Field | Value |
|---|---|
| Tester |  |
| Date / time |  |
| Operating system |  |
| Browser and version |  |
| Controller model |  |
| Connection type | USB / Bluetooth / other |
| InputFlow commit |  |
| Command baseline | `pnpm validate`, `pnpm browser:test` |

Recommended controller coverage:

- Xbox-compatible controller.
- PlayStation-compatible controller, if available.
- At least one USB connection.
- Bluetooth connection, if available.

Recommended browser coverage:

- Chromium or Chrome.
- Firefox, if available.
- WebKit / Safari, if available on the target platform.

## Preflight

1. Restore dependencies: `pnpm install --frozen-lockfile`.
2. Build and validate: `pnpm validate`.
3. Confirm automated browser smoke: `pnpm browser:test`.
4. Confirm the browser can see the physical controller through a simple
   `navigator.getGamepads()` probe or browser gamepad tester page.

## Manual Steps

For each browser and controller pair:

1. Connect the controller before opening the test page.
2. Open a local browser page or harness that uses `BrowserGamepadSource`.
3. Press the South button once.
4. Confirm `<Gamepad>/button/south` reaches pressed state and releases cleanly.
5. Move the left stick on both axes.
6. Confirm `<Gamepad>/stick/left` reports expected direction and returns to
   neutral after release.
7. Disconnect the controller.
8. Confirm missing gamepad state returns to neutral and no button remains stuck.
9. Reconnect the controller.
10. Repeat South button and left stick checks once after reconnect.

## PASS Criteria

A browser / controller pair passes when:

- South button press and release are observed.
- Left stick x/y movement is observed.
- Neutral state returns after stick release.
- Disconnect resets held button and stick state.
- Reconnect does not require restarting the host page unless the browser itself
  requires user interaction to expose gamepads.

## FAIL Record

Use one row per browser / controller pair:

| Browser | Controller | Connection | Result | Notes / artifact |
|---|---|---|---|---|
|  |  |  | PASS / FAIL / SKIP |  |

Classify failures as one of:

- Browser does not expose the device.
- Browser exposes a nonstandard mapping.
- South button mapping mismatch.
- Left stick mapping mismatch.
- Disconnect does not reset.
- Reconnect does not resume.
- Test harness issue.

## Release Decision

Manual Gamepad failure does not automatically block Phase 8 CI gates. It should
block a release only when the release explicitly claims physical Gamepad support
for the failing browser / controller class.

If a failure is accepted, record the affected device, browser, and user-facing
limitation in the release notes.

