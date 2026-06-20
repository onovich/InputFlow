import { describe, expect, it } from "vitest";
import { ContextRouter } from "../src/index.js";

describe("ContextRouter", () => {
  it("activates contexts as disposable leases", () => {
    const router = new ContextRouter();
    const lease = router.activate({ id: "runtimeGameplay", owner: "test", priority: 400 });

    expect(lease.disposed).toBe(false);
    expect(router.activeContexts()).toMatchObject([
      { id: "runtimeGameplay", owner: "test", priority: 400, routing: "shared" }
    ]);

    lease.dispose();
    expect(lease.disposed).toBe(true);
    expect(router.activeContexts()).toEqual([]);
  });

  it("makes dispose idempotent", () => {
    const router = new ContextRouter();
    const lease = router.activate({ id: "modal", priority: 1000 });

    lease.dispose();
    lease.dispose();

    expect(router.activeContexts()).toEqual([]);
  });

  it("keeps multiple leases predictable by priority then activation order", () => {
    const router = new ContextRouter();

    const gameplay = router.activate({ id: "runtimeGameplay", priority: 400 });
    const modalOne = router.activate({ id: "modal", owner: "first", priority: 1000 });
    const modalTwo = router.activate({ id: "modal", owner: "second", priority: 1000 });

    expect(router.activeContexts().map((context) => context.owner ?? context.id)).toEqual([
      "second",
      "first",
      "runtimeGameplay"
    ]);

    modalTwo.dispose();
    expect(router.activeContexts().map((context) => context.owner ?? context.id)).toEqual([
      "first",
      "runtimeGameplay"
    ]);

    modalOne.dispose();
    gameplay.dispose();
    expect(router.activeContexts()).toEqual([]);
  });
});
