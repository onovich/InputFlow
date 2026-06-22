# InputFlow

Deterministic input runtime primitives for browser games, Web 3D editors, and
interactive tools.

InputFlow turns raw keyboard, pointer, gamepad, virtual, and replay input into
stable action snapshots. Hosts own gameplay semantics, UI behavior, camera
behavior, world picking, and editor commands. InputFlow owns the mechanical input
contract.

> Current status: v0.1 release candidate review. The packages are not published
> by this repository during this review. Do not treat this README as an npm
> release announcement. Phase 13 records the owner decision to defer real
> release while preserving RC-oriented planning decisions. Exact public license
> selection still blocks any future publish.

## Packages

| Package | Role |
|---|---|
| `@inputflow/core` | DOM-free runtime: control paths, binding graph, processors, interactions, action state, context routing, diagnostics. |
| `@inputflow/schema` | Load-time input map, override, and replay trace schemas. |
| `@inputflow/testing` | Virtual input source, fake clock, replay runner, action trace helpers, Sinan contract fixtures. |
| `@inputflow/browser` | Browser keyboard, pointer, wheel, editable-target filtering, blur reset, and basic gamepad sources. |

## Local RC Review

```powershell
pnpm install --frozen-lockfile
pnpm validate
pnpm release:authorization:check
pnpm browser:test
pnpm release:dry-run
```

Optional cross-browser smoke:

```powershell
pnpm browser:test:all
```

Package tarball review:

```powershell
pnpm package:dry-run
```

Sinan POC handoff guard:

```powershell
pnpm sinan:contract:check
```

Manual Gamepad harness guard:

```powershell
pnpm gamepad:harness:check
```

## Minimal Usage

```ts
import { createInputFlow } from "@inputflow/core";
import { VirtualInputSource } from "@inputflow/testing";

const maps = [
  {
    id: "gameplay",
    actions: [{ id: "runtime.gameplay.interact", valueType: "button" }],
    bindings: [
      {
        id: "gameplay.interact.keyboard",
        action: "runtime.gameplay.interact",
        source: { kind: "control", path: "<Keyboard>/code/KeyE" }
      }
    ]
  }
];

const input = createInputFlow({ maps });
const virtual = new VirtualInputSource({ id: "fixture" });
input.addSource(virtual);

virtual.setButton("<Keyboard>/code/KeyE", true, 16);
input.update(16);

const interact = input.readButton("runtime.gameplay.interact");
```

Browser sources live outside core:

```ts
import { createKeyboardSource, createPointerSource } from "@inputflow/browser";

input.addSource(createKeyboardSource());
input.addSource(createPointerSource());
```

For package-specific examples, see `docs/InputFlow-v0.1-API-Examples.md`.
That document covers:

- `@inputflow/core` maps and runtime reads.
- `@inputflow/browser` keyboard, pointer, and gamepad sources.
- `@inputflow/schema` input map and override validation.
- `@inputflow/testing` replay helpers.
- Sinan contract fixtures without shipping an `@inputflow/sinan` package.

## Documentation

- API examples: `docs/InputFlow-v0.1-API-Examples.md`
- Changelog / RC notes: `CHANGELOG.md`
- Technical architecture: `docs/InputFlow-Technical-Architecture-v0.1.md`
- Development plan: `docs/InputFlow-Development-Plan-v0.1.md`
- Browser smoke guide: `docs/InputFlow-Browser-Smoke-Guide.md`
- CI troubleshooting: `docs/InputFlow-CI-Troubleshooting.md`
- Remote CI observation: `docs/InputFlow-Remote-CI-Observation-Guide.md`
- Phase 9 package dry-run audit: `docs/InputFlow-Phase9-Package-Dry-Run-Audit.md`
- Manual Gamepad checklist: `docs/InputFlow-Manual-Gamepad-Release-Checklist.md`
- Manual Gamepad harness guide: `docs/InputFlow-Manual-Gamepad-Harness-Guide.md`
- Phase 10 physical Gamepad evidence: `docs/InputFlow-Phase10-Physical-Gamepad-Evidence.md`
- Phase 10 final report: `docs/InputFlow-Phase10-Final-Report.md`
- Phase 11 final report: `docs/InputFlow-Phase11-Final-Report.md`
- Phase 11 Sinan handoff strategy: `docs/sinan-cooperation/inputflow-sinan-poc-handoff-strategy.md`
- Phase 11 Sinan fixture inventory: `docs/sinan-cooperation/inputflow-sinan-contract-fixture-inventory.md`
- Phase 11 Sinan blur/reset scenario: `docs/sinan-cooperation/inputflow-sinan-blur-reset-scenario.md`
- Phase 11 Sinan diagnostics handoff: `docs/sinan-cooperation/inputflow-sinan-diagnostics-handoff.md`
- Phase 11 Sinan downstream acceptance checklist: `docs/sinan-cooperation/inputflow-sinan-downstream-acceptance-checklist.md`
- Phase 11 Sinan package export audit: `docs/sinan-cooperation/inputflow-sinan-package-export-audit.md`
- Phase 11 Sinan handoff packet: `docs/sinan-cooperation/inputflow-sinan-handoff-packet.md`
- Phase 12 release authorization packet: `docs/release/InputFlow-v0.1-Release-Authorization-Packet.md`
- Phase 12 owner decision matrix: `docs/release/InputFlow-v0.1-Owner-Decision-Matrix.md`
- Phase 12 package metadata audit: `docs/release/InputFlow-v0.1-Package-Metadata-Audit.md`
- Phase 12 remote CI evidence: `docs/release/InputFlow-v0.1-Remote-CI-Evidence.md`
- Phase 12 local release confidence: `docs/release/InputFlow-v0.1-Local-Release-Confidence.md`
- Phase 12 publish simulation and provenance notes: `docs/release/InputFlow-v0.1-Publish-Simulation-and-Provenance.md`
- Phase 12 rollback and deprecation policy: `docs/release/InputFlow-v0.1-Rollback-and-Deprecation-Policy.md`
- Phase 12 final release candidate audit: `docs/release/InputFlow-v0.1-Final-Release-Candidate-Audit.md`
- Phase 12 owner sign-off checklist: `docs/release/InputFlow-v0.1-Owner-Sign-Off-Checklist.md`
- Phase 12 final report: `docs/InputFlow-Phase12-Final-Report.md`
- Phase 13 owner decision record: `docs/release/InputFlow-v0.1-Owner-Decision-Record.md`
- Phase 13 final report: `docs/InputFlow-Phase13-Final-Report.md`
- Phase 9 guide: `docs/InputFlow-Phase9-v0.1-Release-Candidate-Goal-Mode-Execution-Guide.md`
- Phase 9 final report: `docs/InputFlow-Phase9-Final-Report.md`

## Current Limits

- No real npm publish, GitHub Release, or git tag in this release-candidate
  review.
- No React diagnostics package or rebind UI in v0.1.
- No mobile virtual joystick, pointer picking, world ray, or entity hit logic.
- No `@inputflow/sinan` package; Sinan integration remains a downstream adapter
  contract with `pnpm sinan:contract:check` verifying only InputFlow-side
  handoff assets.
- Automated gamepad coverage uses a browser-level `navigator.getGamepads`
  fixture. Phase 10 adds a manual harness and evidence table, but the current
  executor environment has no physical controller evidence.
- Firefox and WebKit browser smoke are covered by the optional Playwright
  matrix; physical controller checks remain manual / best effort.
- Phase 13 records `RELEASE_DEFERRED_DECISION_RECORDED`: real release is
  deferred, future RC planning may use `0.1.0-rc.0`, public package, and `next`
  dist-tag as inclinations only, and exact public license remains a blocking
  owner decision before any publish.

## Boundary

`@inputflow/core` must remain free of DOM, React, Three, Sinan, Zod hot-path,
Playwright, GitHub Actions, and release tooling dependencies.
