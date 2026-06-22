# ADR 0009: Physical Gamepad Acceptance Policy

> Status: Accepted for Phase 10
> Date: 2026-06-22

## Context

Phase 7 through Phase 9 established browser gamepad automation through a
browser-level `navigator.getGamepads()` fixture. That automation proves that
`@inputflow/browser` can poll a browser JavaScript gamepad shape and map the
v0.1 Gamepad scope:

- South button to `<Gamepad>/button/south`.
- Left stick to `<Gamepad>/stick/left`.
- Missing or disconnected gamepad state back to neutral values.

The fixture does not prove that a physical controller pairs with a target
browser, exposes the expected mapping, survives disconnect / reconnect, or
behaves consistently across USB and Bluetooth. Phase 10 exists to close or
classify that manual release-confidence risk.

## Decision

Phase 10 will treat physical Gamepad acceptance as manual evidence, not as an
automated required CI gate.

The final Phase 10 status must be exactly one of:

- `HARDWARE_ACCEPTED`: at least one real controller and browser pair has been
  tested through the manual harness, including South button press / release,
  left stick x/y movement, neutral reset, disconnect reset, and reconnect
  behavior.
- `HARNESS_READY_NO_HARDWARE`: the manual harness, evidence template, docs, and
  automated baseline are ready, but the executor environment has no physical
  controller evidence. This status must not claim physical Gamepad PASS.
- `HARDWARE_BLOCKED`: the harness or required manual evidence is blocked by a
  real issue that needs hardware, browser, operating-system, or user
  intervention before release confidence can be resolved.

Physical evidence must record tester, operating system, browser, controller
model, connection type, InputFlow commit, result, notes, and artifact
references. Automated fixture results may be listed as baseline confidence, but
they are not a substitute for real controller evidence.

## Non-Goals

Phase 10 must not:

- Create physical Gamepad lab automation.
- Promote physical Gamepad checks to a required CI gate.
- Add long-lived player assignment, remapping, or multi-controller pairing.
- Add a React diagnostics package or rebind UI.
- Add a Sinan package or Sinan adapter implementation.
- Publish npm packages, create a GitHub Release, or create a git tag.
- Add DOM, Playwright, manual harness, GitHub Actions, or release tooling
  dependencies to `@inputflow/core`.

## Rationale

Real controller support depends on browser exposure, operating-system pairing,
connection type, controller mapping, and human-observed disconnect / reconnect
behavior. Those facts are valuable for release review but are not stable enough
to be required in CI without a dedicated hardware lab.

Keeping physical acceptance manual preserves the existing CI contract while
making the release-confidence gap explicit and reviewable.

## Evidence Requirements

The Phase 10 evidence record should distinguish:

- Automated browser fixture baseline.
- Manual harness readiness.
- Real browser / controller / connection results.
- Skipped or blocked browser and connection combinations.
- Final release-confidence status.

If no physical controller is available, the evidence must say so directly and
the final status must be `HARNESS_READY_NO_HARDWARE` or `HARDWARE_BLOCKED`.

## Consequences

- Reviewers can see exactly what was tested with real hardware and what remains
  untested.
- The project can ship a reusable local harness without pretending that CI has
  hardware coverage.
- Browser gamepad automation remains useful as a regression guard for mapping
  and polling, while physical pairing remains an explicit manual boundary.
