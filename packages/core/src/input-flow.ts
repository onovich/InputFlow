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

export interface InputFlow {
  addSource(source: InputSource): void;
  activateContext(options: InputContextOptions): ContextLease;
  activeContexts(): readonly ActiveInputContext[];
  update(timeMs: number): ActionSnapshot;
  readButton(actionId: string | ActionId): ButtonActionState;
  snapshot(): ActionSnapshot;
  dispose(): void;
}

interface ButtonCandidate {
  readonly value: number;
  readonly sourceControl: ControlPath;
}

export const createInputFlow = (options: InputFlowOptions): InputFlow => {
  const graph = compileBindingGraph(options.maps);
  const queue = new RawEventQueue();
  const deviceState = new DeviceState();
  const contexts = new ContextRouter();
  const sources = new Map<string, InputSource>();
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

  const collectButtonCandidates = (): Map<ActionId, ButtonCandidate> => {
    const candidates = new Map<ActionId, ButtonCandidate>();
    const activeContexts = contexts.activeContexts();
    const consumedControls = new Set<ControlPath>();

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
      return candidates;
    }

    for (const context of activeContexts) {
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
        }
      }

      if (context.routing === "exclusive") {
        break;
      }
    }

    return candidates;
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

      const candidates = collectButtonCandidates();
      const buttons = new Map<ActionId, ButtonActionState>();
      for (const action of graph.actions.values()) {
        if (action.valueType !== "button") {
          continue;
        }
        buttons.set(action.id, evaluateButton(action.id, candidates.get(action.id), timeMs));
      }

      snapshot = { timeMs, buttons };
      return snapshot;
    },

    readButton(actionId) {
      const id = asActionId(actionId);
      return snapshot.buttons.get(id) ?? createReleasedButtonState(id);
    },

    snapshot() {
      return snapshot;
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
