import { createControlPath } from "./control-path.js";
import type {
  BindingSourceDefinition,
  InputBindingDefinition,
  InputMapDefinition,
  InteractionDefinition
} from "./binding-graph.js";
import type { InputDiagnostic } from "./diagnostics.js";
import type { ControlPath } from "./ids.js";
import type { ProcessorDefinition } from "./processors/index.js";

export interface BindingOverrideDefinition {
  readonly bindingId: string;
  readonly path?: string | ControlPath;
  readonly source?: BindingSourceDefinition;
  readonly processors?: readonly ProcessorDefinition[];
  readonly interactions?: readonly InteractionDefinition[];
  readonly disabled?: boolean;
}

export interface OverrideSetDefinition {
  readonly schemaVersion?: 1;
  readonly baseMapId?: string;
  readonly profileId?: string;
  readonly bindingOverrides: readonly BindingOverrideDefinition[];
}

export interface ApplyBindingOverridesResult {
  readonly maps: readonly InputMapDefinition[];
  readonly diagnostics: readonly InputDiagnostic[];
}

interface PreparedOverride {
  readonly override: BindingOverrideDefinition;
  readonly source?: BindingSourceDefinition;
}

export const applyBindingOverrides = (
  maps: readonly InputMapDefinition[],
  overrideSet: OverrideSetDefinition
): ApplyBindingOverridesResult => {
  const diagnostics: InputDiagnostic[] = [];
  const overridesByBinding = new Map<string, PreparedOverride>();

  overrideSet.bindingOverrides.forEach((override, overrideIndex) => {
    const prepared = prepareOverride(override, overrideIndex, diagnostics);
    if (!prepared) {
      return;
    }

    if (overridesByBinding.has(override.bindingId)) {
      diagnostics.push({
        severity: "error",
        code: "BINDING_CONFLICT",
        message: `Duplicate override for binding ${override.bindingId}`,
        bindingId: override.bindingId,
        overrideIndex
      });
      return;
    }

    overridesByBinding.set(override.bindingId, prepared);
  });

  const appliedBindingIds = new Set<string>();
  const nextMaps = maps.map((map) => {
    const nextBindings: InputBindingDefinition[] = [];

    for (const binding of map.bindings) {
      const prepared = overridesByBinding.get(binding.id);
      if (!prepared) {
        nextBindings.push(binding);
        continue;
      }

      appliedBindingIds.add(binding.id);
      if (prepared.override.disabled === true) {
        continue;
      }

      nextBindings.push(applyBindingOverride(binding, prepared));
    }

    return { ...map, bindings: nextBindings };
  });

  for (const [bindingId, prepared] of overridesByBinding.entries()) {
    if (!appliedBindingIds.has(bindingId)) {
      diagnostics.push({
        severity: "warning",
        code: "INVALID_OVERRIDE",
        message: `Override target binding not found: ${bindingId}`,
        bindingId,
        overrideIndex: overrideSet.bindingOverrides.indexOf(prepared.override)
      });
    }
  }

  return {
    maps: nextMaps,
    diagnostics
  };
};

const prepareOverride = (
  override: BindingOverrideDefinition,
  overrideIndex: number,
  diagnostics: InputDiagnostic[]
): PreparedOverride | undefined => {
  const hasChange =
    override.path !== undefined ||
    override.source !== undefined ||
    override.processors !== undefined ||
    override.interactions !== undefined ||
    override.disabled !== undefined;

  if (!hasChange) {
    diagnostics.push({
      severity: "error",
      code: "INVALID_OVERRIDE",
      message: `Override for binding ${override.bindingId} does not contain a change`,
      bindingId: override.bindingId,
      overrideIndex
    });
    return undefined;
  }

  if (override.path !== undefined && override.source !== undefined) {
    diagnostics.push({
      severity: "error",
      code: "INVALID_OVERRIDE",
      message: `Override for binding ${override.bindingId} cannot define both path and source`,
      bindingId: override.bindingId,
      overrideIndex
    });
    return undefined;
  }

  const source = override.path !== undefined
    ? normalizeBindingSource({ kind: "control", path: override.path })
    : override.source === undefined
      ? undefined
      : normalizeBindingSource(override.source);

  if (source instanceof Error) {
    diagnostics.push({
      severity: "error",
      code: "INVALID_OVERRIDE",
      message: source.message,
      bindingId: override.bindingId,
      overrideIndex
    });
    return undefined;
  }

  return {
    override,
    ...(source ? { source } : {})
  };
};

const applyBindingOverride = (
  binding: InputBindingDefinition,
  prepared: PreparedOverride
): InputBindingDefinition => ({
  ...binding,
  ...(prepared.source ? { source: prepared.source } : {}),
  ...(prepared.override.processors !== undefined ? { processors: prepared.override.processors } : {}),
  ...(prepared.override.interactions !== undefined ? { interactions: prepared.override.interactions } : {})
});

const normalizeBindingSource = (
  source: BindingSourceDefinition
): BindingSourceDefinition | Error => {
  try {
    if (source.kind === "control") {
      return { kind: "control", path: createControlPath(source.path) };
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
  } catch (error) {
    return error instanceof Error ? error : new Error("Invalid override binding source");
  }
};
