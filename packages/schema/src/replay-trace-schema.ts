import { z } from "zod";

const nonNegativeTimeSchema = z.number().finite().nonnegative();

const vector2Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite()
});

const controlPathSchema = z
  .string()
  .regex(/^<[A-Za-z][A-Za-z0-9]*>\/[^/\s]+\/.+$/, "Invalid control path");

const routingPolicySchema = z.union([
  z.literal("shared"),
  z.literal("consumeMatched"),
  z.literal("exclusive")
]);

export const replayControlEventV0Schema = z.object({
  t: nonNegativeTimeSchema,
  type: z.literal("control"),
  control: controlPathSchema,
  value: z.union([z.number().finite(), vector2Schema])
});

export const replayContextActivateEventV0Schema = z.object({
  t: nonNegativeTimeSchema,
  type: z.literal("context.activate"),
  contextId: z.string().min(1),
  owner: z.string().min(1).optional(),
  priority: z.number().finite().optional(),
  routing: routingPolicySchema.optional(),
  maps: z.array(z.string().min(1)).optional()
});

export const replayContextDeactivateEventV0Schema = z.object({
  t: nonNegativeTimeSchema,
  type: z.literal("context.deactivate"),
  contextId: z.string().min(1)
});

export const replayFrameEventV0Schema = z.object({
  t: nonNegativeTimeSchema,
  type: z.literal("frame")
});

export const replayTraceEventV0Schema = z.discriminatedUnion("type", [
  replayControlEventV0Schema,
  replayContextActivateEventV0Schema,
  replayContextDeactivateEventV0Schema,
  replayFrameEventV0Schema
]);

export const replayTraceV0Schema = z.object({
  schemaVersion: z.literal(1),
  kind: z.literal("raw-control-trace"),
  clock: z.literal("relative-ms"),
  events: z.array(replayTraceEventV0Schema)
});

export type ReplayControlEventV0 = z.infer<typeof replayControlEventV0Schema>;
export type ReplayContextActivateEventV0 = z.infer<typeof replayContextActivateEventV0Schema>;
export type ReplayContextDeactivateEventV0 = z.infer<typeof replayContextDeactivateEventV0Schema>;
export type ReplayFrameEventV0 = z.infer<typeof replayFrameEventV0Schema>;
export type ReplayTraceEventV0 = z.infer<typeof replayTraceEventV0Schema>;
export type ReplayTraceV0 = z.infer<typeof replayTraceV0Schema>;
