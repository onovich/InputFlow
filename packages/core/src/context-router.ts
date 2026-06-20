import { asContextId, type ContextId } from "./ids.js";

export type ContextRoutingPolicy = "shared" | "consumeMatched" | "exclusive";

export interface InputContextOptions {
  readonly id: string | ContextId;
  readonly owner?: string;
  readonly priority?: number;
  readonly routing?: ContextRoutingPolicy;
  readonly maps?: readonly string[];
}

export interface ActiveInputContext {
  readonly leaseId: string;
  readonly id: ContextId;
  readonly owner?: string;
  readonly priority: number;
  readonly routing: ContextRoutingPolicy;
  readonly maps: readonly string[];
  readonly activatedOrder: number;
}

export interface ContextLease {
  readonly id: string;
  readonly contextId: ContextId;
  readonly disposed: boolean;
  dispose(): void;
}

export class ContextRouter {
  #active = new Map<string, ActiveInputContext>();
  #nextLeaseNumber = 1;
  #nextActivatedOrder = 1;

  activate(options: InputContextOptions): ContextLease {
    const contextId = asContextId(options.id);
    const leaseId = `${contextId}#${this.#nextLeaseNumber++}`;
    const context: ActiveInputContext = {
      leaseId,
      id: contextId,
      priority: options.priority ?? 0,
      routing: options.routing ?? "shared",
      maps: options.maps ?? [],
      activatedOrder: this.#nextActivatedOrder++,
      ...(options.owner ? { owner: options.owner } : {})
    };

    this.#active.set(leaseId, context);

    let disposed = false;
    return {
      id: leaseId,
      contextId,
      get disposed() {
        return disposed;
      },
      dispose: () => {
        if (disposed) {
          return;
        }
        disposed = true;
        this.#active.delete(leaseId);
      }
    };
  }

  activeContexts(): ActiveInputContext[] {
    return [...this.#active.values()].sort(
      (left, right) =>
        right.priority - left.priority || right.activatedOrder - left.activatedOrder
    );
  }

  clear(): void {
    this.#active.clear();
  }
}
