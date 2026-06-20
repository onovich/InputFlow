import { describe, expect, it } from "vitest";
import {
  migrationDescriptorV0Schema,
  overrideDocumentV0Schema,
  type OverrideDocumentV0,
  type SchemaMigrationHookV0
} from "../src/index.js";

describe("override schema", () => {
  it("accepts path-based binding overrides without copying default maps", () => {
    const parsed = overrideDocumentV0Schema.parse({
      schemaVersion: 1,
      baseMapId: "sinan.default",
      profileId: "local-user",
      bindingOverrides: [
        {
          bindingId: "gameplay.interact.keyboard",
          path: "<Keyboard>/code/KeyF"
        }
      ]
    });

    expect(parsed.bindingOverrides[0]?.bindingId).toBe("gameplay.interact.keyboard");
  });

  it("accepts structured source overrides for non-control bindings", () => {
    const parsed = overrideDocumentV0Schema.parse({
      schemaVersion: 1,
      baseMapId: "default",
      bindingOverrides: [
        {
          bindingId: "move.horizontal",
          source: {
            kind: "composite1d",
            negative: "<Keyboard>/code/KeyA",
            positive: "<Keyboard>/code/KeyD"
          },
          processors: [{ type: "clamp", min: -1, max: 1 }]
        }
      ]
    });

    expect(parsed.bindingOverrides[0]?.source?.kind).toBe("composite1d");
  });

  it("rejects ambiguous or empty override entries", () => {
    const empty = overrideDocumentV0Schema.safeParse({
      schemaVersion: 1,
      baseMapId: "default",
      bindingOverrides: [{ bindingId: "interact.keyboard" }]
    });

    const ambiguous = overrideDocumentV0Schema.safeParse({
      schemaVersion: 1,
      baseMapId: "default",
      bindingOverrides: [
        {
          bindingId: "interact.keyboard",
          path: "<Keyboard>/code/KeyF",
          source: { kind: "control", path: "<Keyboard>/code/KeyG" }
        }
      ]
    });

    expect(empty.success).toBe(false);
    expect(ambiguous.success).toBe(false);
  });

  it("exposes a migration hook shape for override upgrades", () => {
    const descriptor = migrationDescriptorV0Schema.parse({
      kind: "override",
      fromVersion: 0,
      toVersion: 1
    });

    const hook: SchemaMigrationHookV0<OverrideDocumentV0> = {
      ...descriptor,
      migrate: () => ({
        schemaVersion: 1,
        baseMapId: "default",
        bindingOverrides: []
      })
    };

    expect(hook.migrate({}).baseMapId).toBe("default");
  });
});
