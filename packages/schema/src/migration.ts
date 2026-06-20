import { z } from "zod";

export const migrationTargetKindV0Schema = z.union([
  z.literal("input-map"),
  z.literal("override")
]);

export const migrationDescriptorV0Schema = z.object({
  kind: migrationTargetKindV0Schema,
  fromVersion: z.number().int().nonnegative(),
  toVersion: z.literal(1)
}).strict();

export interface SchemaMigrationHookV0<TOutput> {
  readonly kind: z.infer<typeof migrationTargetKindV0Schema>;
  readonly fromVersion: number;
  readonly toVersion: 1;
  migrate(raw: unknown): TOutput;
}

export type MigrationTargetKindV0 = z.infer<typeof migrationTargetKindV0Schema>;
export type MigrationDescriptorV0 = z.infer<typeof migrationDescriptorV0Schema>;
