import { createControlPath } from "./control-path.js";
import { asActionId, type ActionId, type ControlPath } from "./ids.js";
import type { ActionValueType } from "./action-state.js";
import type { ProcessorDefinition } from "./processors/index.js";

export interface InputActionDefinition {
  readonly id: string | ActionId;
  readonly valueType: ActionValueType;
}

export interface ControlBindingSourceDefinition {
  readonly kind: "control";
  readonly path: string | ControlPath;
}

export interface Composite1DBindingSourceDefinition {
  readonly kind: "composite1d";
  readonly negative: string | ControlPath;
  readonly positive: string | ControlPath;
}

export interface Composite2DBindingSourceDefinition {
  readonly kind: "composite2d";
  readonly up: string | ControlPath;
  readonly down: string | ControlPath;
  readonly left: string | ControlPath;
  readonly right: string | ControlPath;
}

export type BindingSourceDefinition =
  | ControlBindingSourceDefinition
  | Composite1DBindingSourceDefinition
  | Composite2DBindingSourceDefinition;

export interface PressInteractionDefinition {
  readonly type: "press";
  readonly pressPoint?: number;
  readonly releasePoint?: number;
}

export interface TapInteractionDefinition {
  readonly type: "tap";
  readonly pressPoint?: number;
  readonly releasePoint?: number;
  readonly maxDurationMs?: number;
}

export interface HoldInteractionDefinition {
  readonly type: "hold";
  readonly pressPoint?: number;
  readonly releasePoint?: number;
  readonly minDurationMs?: number;
}

export interface RepeatInteractionDefinition {
  readonly type: "repeat";
  readonly pressPoint?: number;
  readonly releasePoint?: number;
  readonly delayMs?: number;
  readonly intervalMs?: number;
}

export type InteractionDefinition =
  | PressInteractionDefinition
  | TapInteractionDefinition
  | HoldInteractionDefinition
  | RepeatInteractionDefinition;

export interface InputBindingDefinition {
  readonly id: string;
  readonly action: string | ActionId;
  readonly source: BindingSourceDefinition;
  readonly processors?: readonly ProcessorDefinition[];
  readonly interactions?: readonly InteractionDefinition[];
}

export interface InputMapDefinition {
  readonly id?: string;
  readonly actions: readonly InputActionDefinition[];
  readonly bindings: readonly InputBindingDefinition[];
}

export interface CompiledAction {
  readonly id: ActionId;
  readonly valueType: ActionValueType;
}

export interface CompiledBinding {
  readonly id: string;
  readonly mapId: string;
  readonly action: ActionId;
  readonly control: ControlPath;
  readonly controls: readonly ControlPath[];
  readonly source: CompiledBindingSource;
  readonly processors: readonly ProcessorDefinition[];
  readonly interaction: InteractionDefinition;
}

export type CompiledBindingSource =
  | {
      readonly kind: "control";
      readonly control: ControlPath;
    }
  | {
      readonly kind: "composite1d";
      readonly negative: ControlPath;
      readonly positive: ControlPath;
    }
  | {
      readonly kind: "composite2d";
      readonly up: ControlPath;
      readonly down: ControlPath;
      readonly left: ControlPath;
      readonly right: ControlPath;
    };

export interface CompiledBindingGraph {
  readonly actions: ReadonlyMap<ActionId, CompiledAction>;
  readonly bindings: readonly CompiledBinding[];
  readonly bindingsByControl: ReadonlyMap<ControlPath, readonly CompiledBinding[]>;
}

export const compileBindingGraph = (
  maps: readonly InputMapDefinition[]
): CompiledBindingGraph => {
  const actions = new Map<ActionId, CompiledAction>();
  const bindings: CompiledBinding[] = [];
  const bindingIds = new Set<string>();

  for (const map of maps) {
    const mapId = map.id ?? "__default";
    for (const action of map.actions) {
      const actionId = asActionId(action.id);
      if (actions.has(actionId)) {
        throw new Error(`Duplicate action id: ${action.id}`);
      }
      actions.set(actionId, { id: actionId, valueType: action.valueType });
    }

    for (const binding of map.bindings) {
      if (bindingIds.has(binding.id)) {
        throw new Error(`Duplicate binding id: ${binding.id}`);
      }
      bindingIds.add(binding.id);

      const actionId = asActionId(binding.action);
      const action = actions.get(actionId);
      if (!action) {
        throw new Error(`Binding ${binding.id} references unknown action: ${binding.action}`);
      }
      const source = compileBindingSource(binding.source);
      const controls = getBindingControls(source);

      bindings.push({
        id: binding.id,
        mapId,
        action: actionId,
        control: controls[0] ?? createControlPath("<Unknown>/control/missing"),
        controls,
        source,
        processors: binding.processors ?? [],
        interaction: binding.interactions?.[0] ?? { type: "press" }
      });
    }
  }

  const byControl = new Map<ControlPath, CompiledBinding[]>();
  for (const binding of bindings) {
    const existing = byControl.get(binding.control) ?? [];
    existing.push(binding);
    byControl.set(binding.control, existing);
  }

  return {
    actions,
    bindings,
    bindingsByControl: byControl
  };
};

const compileBindingSource = (source: BindingSourceDefinition): CompiledBindingSource => {
  if (source.kind === "control") {
    return { kind: "control", control: createControlPath(source.path) };
  }

  if (source.kind === "composite1d") {
    return {
      kind: "composite1d",
      negative: createControlPath(source.negative),
      positive: createControlPath(source.positive)
    };
  }

  return {
    kind: "composite2d",
    up: createControlPath(source.up),
    down: createControlPath(source.down),
    left: createControlPath(source.left),
    right: createControlPath(source.right)
  };
};

const getBindingControls = (source: CompiledBindingSource): readonly ControlPath[] => {
  if (source.kind === "control") {
    return [source.control];
  }

  if (source.kind === "composite1d") {
    return [source.negative, source.positive];
  }

  return [source.up, source.down, source.left, source.right];
};
