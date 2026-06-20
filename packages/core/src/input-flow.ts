import {
  createReleasedButtonState,
  type ButtonActionState
} from "./action-state.js";
import {
  compileBindingGraph,
  type CompiledBinding,
  type InputMapDefinition
} from "./binding-graph.js";
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
  update(timeMs: number): ActionSnapshot;
  readButton(actionId: string | ActionId): ButtonActionState;
  snapshot(): ActionSnapshot;
  dispose(): void;
}

export const createInputFlow = (options: InputFlowOptions): InputFlow => {
  const graph = compileBindingGraph(options.maps);
  const queue = new RawEventQueue();
  const deviceState = new DeviceState();
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
    bindings: readonly CompiledBinding[],
    timeMs: number
  ): ButtonActionState => {
    const previous = snapshot.buttons.get(actionId) ?? createReleasedButtonState(actionId);
    let value = 0;
    let sourceControl: ControlPath | undefined;

    for (const binding of bindings) {
      const controlValue = deviceState.readScalar(binding.control);
      if (controlValue > value) {
        value = controlValue;
        sourceControl = binding.control;
      }
    }

    return evaluatePress({
      actionId,
      previous,
      value,
      timeMs,
      ...(sourceControl ? { sourceControl } : {})
    });
  };

  return {
    addSource(source) {
      sources.set(source.id, source);
      source.connect(sink);
    },

    update(timeMs) {
      for (const source of sources.values()) {
        source.sample?.(timeMs);
      }
      for (const event of queue.drainSorted()) {
        deviceState.apply(event);
      }

      const bindingsByAction = new Map<ActionId, CompiledBinding[]>();
      for (const binding of graph.bindings) {
        const existing = bindingsByAction.get(binding.action) ?? [];
        existing.push(binding);
        bindingsByAction.set(binding.action, existing);
      }

      const buttons = new Map<ActionId, ButtonActionState>();
      for (const action of graph.actions.values()) {
        if (action.valueType !== "button") {
          continue;
        }
        buttons.set(action.id, evaluateButton(action.id, bindingsByAction.get(action.id) ?? [], timeMs));
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
    }
  };
};
