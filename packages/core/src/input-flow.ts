import {
  createReleasedButtonState,
  type ButtonActionState
} from "./action-state.js";
import {
  compileBindingGraph,
  type CompiledBinding,
  type InputMapDefinition
} from "./binding-graph.js";
import {
  ContextRouter,
  type ActiveInputContext,
  type ContextLease,
  type InputContextOptions
} from "./context-router.js";
import { DeviceState } from "./device-state.js";
import type { ControlState } from "./device-state.js";
import type { InputDiagnostic } from "./diagnostics.js";
import { asActionId, type ActionId, type ControlPath } from "./ids.js";
import { evaluatePress } from "./interactions/press.js";
import { RawEventQueue } from "./raw-event-queue.js";
import type { InputSource, RawInputSink } from "./source.js";

export interface InputFlowOptions {
  readonly maps: readonly InputMapDefinition[];
}

export interface ActionSnapshot {
  readonly timeMs: number;
  readonly buttons: ReadonlyMap<ActionId, ButtonActionState>;
}

export interface InputDebugSnapshot {
  readonly timeMs: number;
  readonly activeContexts: readonly ActiveInputContext[];
  readonly consumedControls: readonly ControlPath[];
  readonly pressedControls: readonly ControlState[];
  readonly diagnostics: readonly InputDiagnostic[];
}

export interface InputFlow {
  addSource(source: InputSource): void;
  activateContext(options: InputContextOptions): ContextLease;
  activeContexts(): readonly ActiveInputContext[];
  update(timeMs: number): ActionSnapshot;
  readButton(actionId: string | ActionId): ButtonActionState;
  snapshot(): ActionSnapshot;
  debugSnapshot(): InputDebugSnapshot;
  dispose(): void;
}

interface ButtonCandidate {
  readonly value: number;
  readonly sourceControl: ControlPath;
}

interface ButtonCollectionResult {
  readonly candidates: ReadonlyMap<ActionId, ButtonCandidate>;
  readonly consumedControls: readonly ControlPath[];
  readonly diagnostics: readonly InputDiagnostic[];
}

export const createInputFlow = (options: InputFlowOptions): InputFlow => {
  const graph = compileBindingGraph(options.maps);
  const queue = new RawEventQueue();
  const deviceState = new DeviceState();
  const contexts = new ContextRouter();
  const sources = new Map<string, InputSource>();
  let debugSnapshot: InputDebugSnapshot = {
    timeMs: 0,
    activeContexts: [],
    consumedControls: [],
    pressedControls: [],
    diagnostics: []
  };
  let snapshot: ActionSnapshot = {
    timeMs: 0,
    buttons: new Map(
      [...graph.actions.values()]
        .filter((action) => action.valueType === "button")
        .map((action) => [action.id, createReleasedButtonState(action.id)])
    )
  };

  const sink: RawInputSink = {
    push: (event) => queue.enqueue(event)
  };

  const evaluateButton = (
    actionId: ActionId,
    candidate: ButtonCandidate | undefined,
    timeMs: number
  ): ButtonActionState => {
    const previous = snapshot.buttons.get(actionId) ?? createReleasedButtonState(actionId);

    return evaluatePress({
      actionId,
      previous,
      value: candidate?.value ?? 0,
      timeMs,
      ...(candidate?.sourceControl ? { sourceControl: candidate.sourceControl } : {})
    });
  };

  const contextIncludesBinding = (
    contextMaps: readonly string[],
    binding: CompiledBinding
  ): boolean => contextMaps.length === 0 || contextMaps.includes(binding.mapId);

  const collectButtonCandidates = (): ButtonCollectionResult => {
    const candidates = new Map<ActionId, ButtonCandidate>();
    const activeContexts = contexts.activeContexts();
    const consumedControls = new Set<ControlPath>();
    const diagnostics: InputDiagnostic[] = [];

    const applyBinding = (binding: CompiledBinding): boolean => {
      if (consumedControls.has(binding.control)) {
        return false;
      }

      const value = deviceState.readScalar(binding.control);
      const existing = candidates.get(binding.action);
      if (!existing || value > existing.value) {
        candidates.set(binding.action, { value, sourceControl: binding.control });
      }

      const pressPoint = binding.interaction.pressPoint ?? 0.5;
      return value >= pressPoint;
    };

    if (activeContexts.length === 0) {
      for (const binding of graph.bindings) {
        applyBinding(binding);
      }
      return { candidates, consumedControls: [], diagnostics };
    }

    for (const [index, context] of activeContexts.entries()) {
      const contextBindings = graph.bindings.filter((binding) =>
        contextIncludesBinding(context.maps, binding)
      );
      const matchedControls = new Set<ControlPath>();

      for (const binding of contextBindings) {
        const matched = applyBinding(binding);
        if (matched) {
          matchedControls.add(binding.control);
        }
      }

      if (context.routing === "consumeMatched") {
        for (const control of matchedControls) {
          consumedControls.add(control);
          diagnostics.push({
            severity: "info",
            code: "CONTROL_CONSUMED",
            message: `Control ${control} consumed by context ${context.id}`,
            contextId: context.id,
            control
          });
        }
      }

      if (context.routing === "exclusive") {
        if (index < activeContexts.length - 1) {
          diagnostics.push({
            severity: "info",
            code: "CONTEXT_EXCLUSIVE_BLOCK",
            message: `Context ${context.id} blocked lower-priority contexts`,
            contextId: context.id
          });
        }
        break;
      }
    }

    return {
      candidates,
      consumedControls: [...consumedControls],
      diagnostics
    };
  };

  return {
    addSource(source) {
      sources.set(source.id, source);
      source.connect(sink);
    },

    activateContext(options) {
      return contexts.activate(options);
    },

    activeContexts() {
      return contexts.activeContexts();
    },

    update(timeMs) {
      for (const source of sources.values()) {
        source.sample?.(timeMs);
      }
      for (const event of queue.drainSorted()) {
        deviceState.apply(event);
      }

      const collection = collectButtonCandidates();
      const buttons = new Map<ActionId, ButtonActionState>();
      for (const action of graph.actions.values()) {
        if (action.valueType !== "button") {
          continue;
        }
        buttons.set(action.id, evaluateButton(action.id, collection.candidates.get(action.id), timeMs));
      }

      snapshot = { timeMs, buttons };
      debugSnapshot = {
        timeMs,
        activeContexts: contexts.activeContexts(),
        consumedControls: collection.consumedControls,
        pressedControls: deviceState.entries().filter((state) => state.value !== 0),
        diagnostics: collection.diagnostics
      };
      return snapshot;
    },

    readButton(actionId) {
      const id = asActionId(actionId);
      return snapshot.buttons.get(id) ?? createReleasedButtonState(id);
    },

    snapshot() {
      return snapshot;
    },

    debugSnapshot() {
      return debugSnapshot;
    },

    dispose() {
      for (const source of sources.values()) {
        source.disconnect();
      }
      sources.clear();
      contexts.clear();
    }
  };
};
