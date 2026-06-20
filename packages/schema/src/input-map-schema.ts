import { z } from "zod";

export const finiteNumberV0Schema = z.number().finite();
export const nonNegativeNumberV0Schema = finiteNumberV0Schema.nonnegative();
export const positiveNumberV0Schema = finiteNumberV0Schema.positive();

export const opaqueIdV0Schema = z.string().min(1);

export const controlPathV0Schema = z
  .string()
  .regex(/^<[A-Za-z][A-Za-z0-9]*>\/[^/\s]+\/.+$/, "Invalid control path");

export const actionValueTypeV0Schema = z.union([
  z.literal("button"),
  z.literal("axis1d"),
  z.literal("axis2d")
]);

export const actionCombinePolicyV0Schema = z.union([
  z.literal("or"),
  z.literal("maxMagnitude"),
  z.literal("sumClamp"),
  z.literal("latestActuated")
]);

export const inputActionV0Schema = z.object({
  id: opaqueIdV0Schema,
  valueType: actionValueTypeV0Schema,
  combine: actionCombinePolicyV0Schema.optional(),
  bufferMs: nonNegativeNumberV0Schema.optional()
}).strict();

export const controlBindingSourceV0Schema = z.object({
  kind: z.literal("control"),
  path: controlPathV0Schema
}).strict();

export const composite1DBindingSourceV0Schema = z.object({
  kind: z.literal("composite1d"),
  negative: controlPathV0Schema,
  positive: controlPathV0Schema
}).strict();

export const composite2DBindingSourceV0Schema = z.object({
  kind: z.literal("composite2d"),
  up: controlPathV0Schema,
  down: controlPathV0Schema,
  left: controlPathV0Schema,
  right: controlPathV0Schema
}).strict();

export const bindingSourceV0Schema = z.discriminatedUnion("kind", [
  controlBindingSourceV0Schema,
  composite1DBindingSourceV0Schema,
  composite2DBindingSourceV0Schema
]);

export const processorV0Schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("deadzone"),
    min: nonNegativeNumberV0Schema.optional()
  }).strict(),
  z.object({
    type: z.literal("radialDeadzone"),
    min: nonNegativeNumberV0Schema.optional(),
    max: positiveNumberV0Schema.optional()
  }).strict(),
  z.object({
    type: z.literal("normalize2d")
  }).strict(),
  z.object({
    type: z.literal("scale"),
    factor: finiteNumberV0Schema
  }).strict(),
  z.object({
    type: z.literal("invert")
  }).strict(),
  z.object({
    type: z.literal("clamp"),
    min: finiteNumberV0Schema,
    max: finiteNumberV0Schema
  }).strict()
]);

const pressThresholdsV0Schema = {
  pressPoint: nonNegativeNumberV0Schema.optional(),
  releasePoint: nonNegativeNumberV0Schema.optional()
};

export const interactionV0Schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("press"),
    ...pressThresholdsV0Schema
  }).strict(),
  z.object({
    type: z.literal("tap"),
    ...pressThresholdsV0Schema,
    maxDurationMs: nonNegativeNumberV0Schema.optional()
  }).strict(),
  z.object({
    type: z.literal("hold"),
    ...pressThresholdsV0Schema,
    minDurationMs: nonNegativeNumberV0Schema.optional()
  }).strict(),
  z.object({
    type: z.literal("repeat"),
    ...pressThresholdsV0Schema,
    delayMs: nonNegativeNumberV0Schema.optional(),
    intervalMs: positiveNumberV0Schema.optional()
  }).strict()
]);

export const inputBindingV0Schema = z.object({
  id: opaqueIdV0Schema,
  action: opaqueIdV0Schema,
  source: bindingSourceV0Schema,
  processors: z.array(processorV0Schema).optional(),
  interactions: z.array(interactionV0Schema).min(1).optional()
}).strict();

export const inputMapV0Schema = z.object({
  id: opaqueIdV0Schema.optional(),
  actions: z.array(inputActionV0Schema),
  bindings: z.array(inputBindingV0Schema)
}).strict();

export const inputMapDocumentV0Schema = z.object({
  schemaVersion: z.literal(1),
  id: opaqueIdV0Schema.optional(),
  maps: z.array(inputMapV0Schema).min(1)
}).strict();

export type ActionValueTypeV0 = z.infer<typeof actionValueTypeV0Schema>;
export type ActionCombinePolicyV0 = z.infer<typeof actionCombinePolicyV0Schema>;
export type InputActionV0 = z.infer<typeof inputActionV0Schema>;
export type ControlBindingSourceV0 = z.infer<typeof controlBindingSourceV0Schema>;
export type Composite1DBindingSourceV0 = z.infer<typeof composite1DBindingSourceV0Schema>;
export type Composite2DBindingSourceV0 = z.infer<typeof composite2DBindingSourceV0Schema>;
export type BindingSourceV0 = z.infer<typeof bindingSourceV0Schema>;
export type ProcessorV0 = z.infer<typeof processorV0Schema>;
export type InteractionV0 = z.infer<typeof interactionV0Schema>;
export type InputBindingV0 = z.infer<typeof inputBindingV0Schema>;
export type InputMapV0 = z.infer<typeof inputMapV0Schema>;
export type InputMapDocumentV0 = z.infer<typeof inputMapDocumentV0Schema>;
