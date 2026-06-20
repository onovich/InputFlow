# InputFlow v0.1 API Examples

These examples show the intended public v0.1 surface. They avoid Sinan-specific
runtime code and keep browser, schema, and testing concerns outside `@inputflow/core`.

## Core Map And Virtual Source

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

## Browser Sources

```ts
import {
  createGamepadSource,
  createKeyboardSource,
  createPointerSource
} from "@inputflow/browser";
import { createInputFlow } from "@inputflow/core";

const input = createInputFlow({ maps });

input.addSource(createKeyboardSource());
input.addSource(createPointerSource());
input.addSource(createGamepadSource());
```

Browser sources are safe to import in non-DOM environments. They resolve browser
objects only when the source is created or connected. Keyboard and pointer sources
filter editable targets by default. Keyboard blur, visibility hidden, and pointer
detach release held controls.

## Schema Validation

```ts
import {
  inputMapDocumentV0Schema,
  overrideDocumentV0Schema
} from "@inputflow/schema";

const inputMapDocument = inputMapDocumentV0Schema.parse(rawMapJson);
const overrides = overrideDocumentV0Schema.parse(rawOverrideJson);
```

Schema validation is a load-time and authoring-time boundary. Do not run Zod
validators inside the frame update hot path.

## Replay Test

```ts
import { runReplayTrace } from "@inputflow/testing";

const trace = {
  schemaVersion: 1,
  kind: "raw-control-trace",
  clock: "relative-ms",
  events: [
    { t: 0, type: "context.activate", contextId: "runtimeGameplay", maps: ["gameplay"] },
    { t: 16, type: "control", control: "<Keyboard>/code/KeyE", value: 1 },
    { t: 16, type: "frame" },
    { t: 32, type: "control", control: "<Keyboard>/code/KeyE", value: 0 },
    { t: 32, type: "frame" }
  ]
};

const actionTrace = runReplayTrace({ maps, trace });
```

## Sinan Contract Fixture

```ts
import {
  createSinanGateAdapterContractFixture,
  runSinanGateAdapterContractReplay
} from "@inputflow/testing";

const fixture = createSinanGateAdapterContractFixture();
const result = runSinanGateAdapterContractReplay(
  fixture.traces.keyboardInteract,
  fixture
);
```

The Sinan adapter itself stays in the Sinan repository for v0.1. InputFlow exposes
generic maps, browser sources, replay helpers, and contract fixtures.
