import { describe, expect, it } from "vitest";
import {
  applyBindingOverrides,
  createControlPath,
  type InputMapDefinition
} from "../src/index.js";

const map: InputMapDefinition = {
  id: "default",
  actions: [{ id: "interact", valueType: "button" }],
  bindings: [
    {
      id: "interact.keyboard",
      action: "interact",
      source: { kind: "control", path: "<Keyboard>/code/KeyE" }
    },
    {
      id: "interact.pointer",
      action: "interact",
      source: { kind: "control", path: "<Pointer>/button/primary" }
    }
  ]
};

describe("applyBindingOverrides", () => {
  it("applies a path override without mutating the default map", () => {
    const result = applyBindingOverrides([map], {
      schemaVersion: 1,
      baseMapId: "default",
      bindingOverrides: [
        {
          bindingId: "interact.keyboard",
          path: "<Keyboard>/code/KeyF"
        }
      ]
    });

    const source = result.maps[0]?.bindings[0]?.source;

    expect(result.diagnostics).toHaveLength(0);
    expect(source).toEqual({ kind: "control", path: createControlPath("<Keyboard>/code/KeyF") });
    expect(map.bindings[0]?.source).toEqual({ kind: "control", path: "<Keyboard>/code/KeyE" });
  });

  it("does not silently apply unresolved overrides", () => {
    const result = applyBindingOverrides([map], {
      bindingOverrides: [
        {
          bindingId: "missing.binding",
          path: "<Keyboard>/code/KeyF"
        }
      ]
    });

    expect(result.maps[0]?.bindings).toHaveLength(2);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "warning",
        code: "INVALID_OVERRIDE",
        bindingId: "missing.binding"
      })
    );
  });

  it("rejects invalid override controls before applying them", () => {
    const result = applyBindingOverrides([map], {
      bindingOverrides: [
        {
          bindingId: "interact.keyboard",
          path: "Keyboard/code/KeyF"
        }
      ]
    });

    expect(result.maps[0]?.bindings[0]?.source).toEqual({
      kind: "control",
      path: "<Keyboard>/code/KeyE"
    });
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "error",
        code: "INVALID_OVERRIDE",
        bindingId: "interact.keyboard"
      })
    );
  });

  it("reports duplicate override targets as binding conflicts", () => {
    const result = applyBindingOverrides([map], {
      bindingOverrides: [
        {
          bindingId: "interact.keyboard",
          path: "<Keyboard>/code/KeyF"
        },
        {
          bindingId: "interact.keyboard",
          path: "<Keyboard>/code/KeyG"
        }
      ]
    });

    expect(result.maps[0]?.bindings[0]?.source).toEqual({
      kind: "control",
      path: createControlPath("<Keyboard>/code/KeyF")
    });
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "error",
        code: "BINDING_CONFLICT",
        bindingId: "interact.keyboard"
      })
    );
  });

  it("can disable a binding without removing the action", () => {
    const result = applyBindingOverrides([map], {
      bindingOverrides: [
        {
          bindingId: "interact.pointer",
          disabled: true
        }
      ]
    });

    expect(result.maps[0]?.actions).toHaveLength(1);
    expect(result.maps[0]?.bindings.map((binding) => binding.id)).toEqual(["interact.keyboard"]);
  });
});
