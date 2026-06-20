import {
  createInputFlow,
  type ActionSnapshot,
  type ContextLease,
  type ContextRoutingPolicy,
  type InputMapDefinition,
  type RawInputValue
} from "@inputflow/core";
import {
  toButtonTraceState,
  type ActionSnapshotTrace,
  type ActionSnapshotTraceFrame
} from "./action-trace.js";
import { FakeClock } from "./fake-clock.js";
import { VirtualInputSource } from "./virtual-input-source.js";

export type ReplayTraceEvent =
  | {
      readonly t: number;
      readonly type: "control";
      readonly control: string;
      readonly value: RawInputValue;
    }
  | {
      readonly t: number;
      readonly type: "context.activate";
      readonly contextId: string;
      readonly owner?: string;
      readonly priority?: number;
      readonly routing?: ContextRoutingPolicy;
      readonly maps?: readonly string[];
    }
  | {
      readonly t: number;
      readonly type: "context.deactivate";
      readonly contextId: string;
    }
  | {
      readonly t: number;
      readonly type: "frame";
    };

export interface ReplayTrace {
  readonly schemaVersion: 1;
  readonly kind: "raw-control-trace";
  readonly clock: "relative-ms";
  readonly events: readonly ReplayTraceEvent[];
}

export interface ReplayRunnerOptions {
  readonly maps: readonly InputMapDefinition[];
  readonly trace: ReplayTrace;
}

const recordFrame = (snapshot: ActionSnapshot): ActionSnapshotTraceFrame => {
  const buttons: ActionSnapshotTraceFrame["buttons"] = {};
  for (const [actionId, state] of snapshot.buttons) {
    buttons[actionId] = toButtonTraceState(state);
  }

  return { t: snapshot.timeMs, buttons };
};

export const runReplayTrace = ({ maps, trace }: ReplayRunnerOptions): ActionSnapshotTrace => {
  const input = createInputFlow({ maps });
  const virtual = new VirtualInputSource({ id: "replay" });
  const clock = new FakeClock();
  const leasesByContext = new Map<string, ContextLease[]>();
  const frames: ActionSnapshotTraceFrame[] = [];
  input.addSource(virtual);

  for (const event of trace.events) {
    clock.set(event.t);

    if (event.type === "control") {
      virtual.setControl(event.control, event.value, clock.now());
      continue;
    }

    if (event.type === "context.activate") {
      const lease = input.activateContext({
        id: event.contextId,
        ...(event.owner ? { owner: event.owner } : {}),
        ...(event.priority !== undefined ? { priority: event.priority } : {}),
        ...(event.routing ? { routing: event.routing } : {}),
        ...(event.maps ? { maps: event.maps } : {})
      });
      const existing = leasesByContext.get(event.contextId) ?? [];
      existing.push(lease);
      leasesByContext.set(event.contextId, existing);
      continue;
    }

    if (event.type === "context.deactivate") {
      const leases = leasesByContext.get(event.contextId) ?? [];
      leases.pop()?.dispose();
      if (leases.length === 0) {
        leasesByContext.delete(event.contextId);
      }
      continue;
    }

    frames.push(recordFrame(input.update(clock.now())));
  }

  input.dispose();
  return {
    schemaVersion: 1,
    kind: "action-snapshot-trace",
    frames
  };
};
