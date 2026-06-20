import { createControlPath } from "./control-path.js";
import { asActionId, type ActionId, type ControlPath } from "./ids.js";
import type { ActionValueType } from "./action-state.js";

export interface InputActionDefinition {
  readonly id: string | ActionId;
  readonly valueType: ActionValueType;
}

export interface ControlBindingSourceDefinition {
  readonly kind: "control";
  readonly path: string | ControlPath;
}

export interface PressInteractionDefinition {
  readonly type: "press";
  readonly pressPoint?: number;
  readonly releasePoint?: number;
}

export type InteractionDefinition = PressInteractionDefinition;

export interface InputBindingDefinition {
  readonly id: string;
  readonly action: string | ActionId;
  readonly source: ControlBindingSourceDefinition;
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
  readonly interaction: PressInteractionDefinition;
}

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
      if (action.valueType !== "button") {
        throw new Error(`Binding ${binding.id} can only target button actions in this phase`);
      }

      bindings.push({
        id: binding.id,
        mapId,
        action: actionId,
        control: createControlPath(binding.source.path),
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
