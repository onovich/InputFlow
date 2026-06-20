import { describe, expect, it } from "vitest";
import {
  compileBindingGraph,
  compileBindingGraphWithDiagnostics,
  type InputMapDefinition
} from "../src/index.js";

describe("binding graph diagnostics", () => {
  it("reports unresolved actions as structured diagnostics", () => {
    const result = compileBindingGraphWithDiagnostics([
      {
        actions: [{ id: "known", valueType: "button" }],
        bindings: [
          {
            id: "broken",
            action: "missing",
            source: { kind: "control", path: "<Keyboard>/code/KeyE" }
          }
        ]
      }
    ]);

    expect(result.graph.bindings).toHaveLength(0);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "error",
        code: "UNRESOLVED_ACTION",
        bindingId: "broken"
      })
    );
  });

  it("keeps compileBindingGraph throw behavior for existing callers", () => {
    expect(() =>
      compileBindingGraph([
        {
          actions: [],
          bindings: [
            {
              id: "broken",
              action: "missing",
              source: { kind: "control", path: "<Keyboard>/code/KeyE" }
            }
          ]
        }
      ])
    ).toThrow("unknown action");
  });

  it("reports duplicate binding ids as binding conflicts", () => {
    const map: InputMapDefinition = {
      actions: [{ id: "interact", valueType: "button" }],
      bindings: [
        {
          id: "interact.keyboard",
          action: "interact",
          source: { kind: "control", path: "<Keyboard>/code/KeyE" }
        },
        {
          id: "interact.keyboard",
          action: "interact",
          source: { kind: "control", path: "<Keyboard>/code/KeyF" }
        }
      ]
    };

    const result = compileBindingGraphWithDiagnostics([map]);

    expect(result.graph.bindings).toHaveLength(1);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "error",
        code: "BINDING_CONFLICT",
        bindingId: "interact.keyboard"
      })
    );
  });

  it("reports invalid control paths without throwing", () => {
    const result = compileBindingGraphWithDiagnostics([
      {
        actions: [{ id: "interact", valueType: "button" }],
        bindings: [
          {
            id: "interact.keyboard",
            action: "interact",
            source: { kind: "control", path: "Keyboard/code/KeyE" }
          }
        ]
      }
    ]);

    expect(result.graph.bindings).toHaveLength(0);
    expect(result.diagnostics[0]).toMatchObject({
      severity: "error",
      code: "INVALID_CONTROL_PATH",
      bindingId: "interact.keyboard"
    });
  });
});
