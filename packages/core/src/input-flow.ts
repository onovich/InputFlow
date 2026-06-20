import {
  createNeutralAxis1DState,
  createNeutralAxis2DState,
  createReleasedButtonState,
  updateAxis1DState,
  updateAxis2DState,
  type Axis1DActionState,
  type Axis2DActionState,
  type ButtonActionState,
  type Vector2
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
import { DeviceState, type ControlState } from "./device-state.js";
import type { InputDiagnostic } from "./diagnostics.js";
import { asActionId, type ActionId, type ControlPath } from "./ids.js";
import { evaluatePress } from "./interactions/press.js";
import { applyProcessors } from "./processors/index.js";
import { RawEventQueue } from "./raw-event-queue.js";
import type { RawInputValue } from "./raw-event.js";
import type { InputSource, RawInputSink } from "./source.js";

export interface InputFlowOptions {
  readonly maps: readonly InputMapDefinition[];
}

export interface ActionSnapshot {
  readonly timeMs: number;
  readonly buttons: ReadonlyMap<ActionId, ButtonActionState>;
  readonly axes1D: ReadonlyMap<ActionId, Axis1DActionState>;
  readonly axes2D: ReadonlyMap<ActionId, Axis2DActionState>;
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
  readAxis1D(actionId: string | ActionId): Axis1DActionState;
  readAxis2D(actionId: string | ActionId): Axis2DActionState;
  snapshot(): ActionSnapshot;
  debugSnapshot(): InputDebugSnapshot;
  dispose(): void;
}

interface ButtonCandidate {
  readonly value: number;
  readonly sourceControl: ControlPath;
}

interface Axis1DCandidate {
  readonly value: number;
  readonly sourceControl?: ControlPath;
}

interface Axis2DCandidate {
  readonly value: Vector2;
  readonly sourceControl?: ControlPath;
}

interface ActionCollectionResult {
  readonly buttons: ReadonlyMap<ActionId, ButtonCandidate>;
  readonly axes1D: ReadonlyMap<ActionId, Axis1DCandidate>;
  readonly axes2D: ReadonlyMap<ActionId, Axis2DCandidate>;
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
    ),
    axes1D: new Map(
      [...graph.actions.values()]
        .filter((action) => action.valueType === "axis1d")
        .map((action) => [action.id, createNeutralAxis1DState(action.id)])
    ),
    axes2D: new Map(
      [...graph.actions.values()]
        .filter((action) => action.valueType === "axis2d")
        .map((action) => [action.id, createNeutralAxis2DState(action.id)])
    )
  };

  const sink: RawInputSink = {
    push: (event) => queue.enqueue(event)
  };

  const contextIncludesBinding = (
    contextMaps: readonly string[],
    binding: CompiledBinding
  ): boolean => contextMaps.length === 0 || contextMaps.includes(binding.mapId);

  const scalarForControl = (control: ControlPath): number => deviceState.readScalar(control);

  const evaluateBindingValue = (binding: CompiledBinding): RawInputValue => {
    if (binding.source.kind === "control") {
      return applyProcessors(deviceState.read(binding.source.control), binding.processors);
    }

    if (binding.source.kind === "composite1d") {
      return applyProcessors(
        scalarForControl(binding.source.positive) - scalarForControl(binding.source.negative),
        binding.processors
      );
    }

    return applyProcessors({
      x: scalarForControl(binding.source.right) - scalarForControl(binding.source.left),
      y: scalarForControl(binding.source.up) - scalarForControl(binding.source.down)
    }, binding.processors);
  };

  const magnitudeOf = (value: RawInputValue): number =>
    typeof value === "number" ? Math.abs(value) : Math.hypot(value.x, value.y);

  const activeSourceControl = (binding: CompiledBinding): ControlPath | undefined =>
    binding.controls.find((control) => scalarForControl(control) !== 0);

  const collectActions = (): ActionCollectionResult => {
    const buttons = new Map<ActionId, ButtonCandidate>();
    const axes1D = new Map<ActionId, Axis1DCandidate>();
    const axes2D = new Map<ActionId, Axis2DCandidate>();
    const activeContexts = contexts.activeContexts();
    const consumedControls = new Set<ControlPath>();
    const diagnostics: InputDiagnostic[] = [];

    const applyBinding = (binding: CompiledBinding): boolean => {
      if (binding.controls.some((control) => consumedControls.has(control))) {
        return false;
      }

      const action = graph.actions.get(binding.action);
      const value = evaluateBindingValue(binding);
      const magnitude = magnitudeOf(value);
      const sourceControl = activeSourceControl(binding);

      if (action?.valueType === "button") {
        const scalarValue = typeof value === "number" ? value : magnitude;
        const existing = buttons.get(binding.action);
        if (!existing || scalarValue > existing.value) {
          buttons.set(binding.action, {
            value: scalarValue,
            sourceControl: sourceControl ?? binding.control
          });
        }
      }

      if (action?.valueType === "axis1d") {
        const scalarValue = typeof value === "number" ? value : value.x;
        const existing = axes1D.get(binding.action);
        if (!existing || Math.abs(scalarValue) > Math.abs(existing.value)) {
          axes1D.set(binding.action, {
            value: scalarValue,
            ...(sourceControl ? { sourceControl } : {})
          });
        }
      }

      if (action?.valueType === "axis2d") {
        const vectorValue = typeof value === "number" ? { x: value, y: 0 } : value;
        const existing = axes2D.get(binding.action);
        if (!existing || magnitude > Math.hypot(existing.value.x, existing.value.y)) {
          axes2D.set(binding.action, {
            value: vectorValue,
            ...(sourceControl ? { sourceControl } : {})
          });
        }
      }

      const pressPoint = binding.interaction.pressPoint ?? 0.5;
      return magnitude >= pressPoint;
    };

    if (activeContexts.length === 0) {
      for (const binding of graph.bindings) {
        applyBinding(binding);
      }
      return { buttons, axes1D, axes2D, consumedControls: [], diagnostics };
    }

    for (const [index, context] of activeContexts.entries()) {
      const contextBindings = graph.bindings.filter((binding) =>
        contextIncludesBinding(context.maps, binding)
      );
      const matchedControls = new Set<ControlPath>();

      for (const binding of contextBindings) {
        const matched = applyBinding(binding);
        if (matched) {
          for (const control of binding.controls) {
            if (scalarForControl(control) !== 0) {
              matchedControls.add(control);
            }
          }
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
      buttons,
      axes1D,
      axes2D,
      consumedControls: [...consumedControls],
      diagnostics
    };
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

      const collection = collectActions();
      const buttons = new Map<ActionId, ButtonActionState>();
      const axes1D = new Map<ActionId, Axis1DActionState>();
      const axes2D = new Map<ActionId, Axis2DActionState>();

      for (const action of graph.actions.values()) {
        if (action.valueType === "button") {
          buttons.set(action.id, evaluateButton(action.id, collection.buttons.get(action.id), timeMs));
        }

        if (action.valueType === "axis1d") {
          const previous = snapshot.axes1D.get(action.id) ?? createNeutralAxis1DState(action.id);
          const candidate = collection.axes1D.get(action.id);
          axes1D.set(
            action.id,
            updateAxis1DState(action.id, previous, candidate?.value ?? 0, candidate?.sourceControl)
          );
        }

        if (action.valueType === "axis2d") {
          const previous = snapshot.axes2D.get(action.id) ?? createNeutralAxis2DState(action.id);
          const candidate = collection.axes2D.get(action.id);
          axes2D.set(
            action.id,
            updateAxis2DState(
              action.id,
              previous,
              candidate?.value ?? { x: 0, y: 0 },
              candidate?.sourceControl
            )
          );
        }
      }

      snapshot = { timeMs, buttons, axes1D, axes2D };
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

    readAxis1D(actionId) {
      const id = asActionId(actionId);
      return snapshot.axes1D.get(id) ?? createNeutralAxis1DState(id);
    },

    readAxis2D(actionId) {
      const id = asActionId(actionId);
      return snapshot.axes2D.get(id) ?? createNeutralAxis2DState(id);
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
