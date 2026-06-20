type Brand<TName extends string> = string & { readonly __brand?: TName };

export type ActionId = Brand<"ActionId">;
export type ContextId = Brand<"ContextId">;
export type ControlPath = Brand<"ControlPath">;
export type DeviceId = Brand<"DeviceId">;
export type SourceId = Brand<"SourceId">;

export const asActionId = (value: string): ActionId => value as ActionId;
export const asContextId = (value: string): ContextId => value as ContextId;
export const asControlPath = (value: string): ControlPath => value as ControlPath;
export const asDeviceId = (value: string): DeviceId => value as DeviceId;
export const asSourceId = (value: string): SourceId => value as SourceId;
