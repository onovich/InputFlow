# InputFlow / Sinan Blur Reset Scenario

Date: 2026-06-22
Status: Phase 11 downstream scenario

## Purpose

This document describes how Sinan should verify stale held-input reset behavior
when a browser tab, canvas, pointer stream, or editor focus is interrupted.

The reset behavior belongs at the browser-source boundary. `@inputflow/core`
must not know about `window`, `document`, `navigator`, visibility events,
pointer events, or focus events.

## InputFlow-Side Evidence

InputFlow already verifies reset behavior with browser smoke tests:

- Keyboard state releases on browser `blur`.
- Keyboard state releases on hidden `visibilitychange`.
- Pointer primary state releases on browser `blur`.
- Pointer primary state releases on `pointercancel`.
- Pointer detach / disconnect releases held pointer state and allows reconnect.

Recommended local evidence command:

```powershell
pnpm browser:test
```

Recommended cross-browser confidence command:

```powershell
pnpm browser:test:all
```

These commands use automated browser fixtures. They do not count as physical
Gamepad hardware acceptance.

## Sinan Downstream Acceptance

Sinan adapter acceptance should record:

- Adapter commit under test.
- Browser and operating system.
- Focus / blur trigger used.
- Whether held `runtime.gameplay.interact` or `editor.viewport.select` state
  returned to released / neutral.
- Whether the next frame after focus returns can read fresh input.
- Logs or screenshots showing stale state did not leak into EngineLoop,
  EventSystem, World, Director, Three, editor store, or UI presentation.

## Expected Adapter Behavior

```txt
Browser blur / visibility / pointer cancel / detach
  -> browser source emits reset or releases tracked controls
  -> InputFlow action snapshot returns held buttons to released
  -> Sinan adapter observes released state on a frame boundary
  -> Sinan owns any UI, EngineLoop, or diagnostics presentation
```

## Non-Scope

- No `@inputflow/sinan` package.
- No Sinan repository changes.
- No Sinan focus policy or final context priority definition.
- No physical Gamepad PASS claim. Phase 10 remains
  `HARNESS_READY_NO_HARDWARE` until real hardware evidence exists.
- No browser globals in `@inputflow/core`.
