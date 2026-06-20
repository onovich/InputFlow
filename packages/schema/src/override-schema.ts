import { z } from "zod";
import {
  bindingSourceV0Schema,
  controlPathV0Schema,
  interactionV0Schema,
  opaqueIdV0Schema,
  processorV0Schema
} from "./input-map-schema.js";

const bindingOverrideV0BaseSchema = z.object({
  bindingId: opaqueIdV0Schema,
  path: controlPathV0Schema.optional(),
  source: bindingSourceV0Schema.optional(),
  processors: z.array(processorV0Schema).optional(),
  interactions: z.array(interactionV0Schema).min(1).optional(),
  disabled: z.boolean().optional()
}).strict();

export const bindingOverrideV0Schema = bindingOverrideV0BaseSchema.superRefine(
  (override, context) => {
    const changes = [
      override.path,
      override.source,
      override.processors,
      override.interactions,
      override.disabled
    ].filter((value) => value !== undefined);

    if (changes.length === 0) {
      context.addIssue({
        code: "custom",
        message: "Binding override must contain at least one change"
      });
    }

    if (override.path !== undefined && override.source !== undefined) {
      context.addIssue({
        code: "custom",
        message: "Binding override cannot define both path and source"
      });
    }
  }
);

export const overrideDocumentV0Schema = z.object({
  schemaVersion: z.literal(1),
  baseMapId: opaqueIdV0Schema,
  profileId: opaqueIdV0Schema.optional(),
  bindingOverrides: z.array(bindingOverrideV0Schema)
}).strict();

export type BindingOverrideV0 = z.infer<typeof bindingOverrideV0Schema>;
export type OverrideDocumentV0 = z.infer<typeof overrideDocumentV0Schema>;
