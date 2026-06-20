import { describe, expect, it } from "vitest";
import {
  createSinanGateAdapterContractFixture,
  runSinanGateAdapterContractReplay,
  sinanGateActionIds
} from "../src/index.js";

describe("Sinan adapter contract fixture", () => {
  it("accepts Keyboard E, Pointer Primary, and Gamepad South for runtime interact", () => {
    const fixture = createSinanGateAdapterContractFixture();
    const traces = [
      fixture.traces.keyboardInteract,
      fixture.traces.pointerInteract,
      fixture.traces.gamepadInteract
    ];

    for (const trace of traces) {
      const result = runSinanGateAdapterContractReplay(trace, fixture);

      expect(result.frames[0]?.buttons[sinanGateActionIds.runtimeInteract]).toMatchObject({
        isPressed: true,
        justPressed: true
      });
      expect(result.frames[1]?.buttons[sinanGateActionIds.runtimeInteract]).toMatchObject({
        isPressed: false,
        justReleased: true
      });
    }
  });

  it("keeps modal input isolated from runtime gameplay", () => {
    const fixture = createSinanGateAdapterContractFixture();
    const result = runSinanGateAdapterContractReplay(fixture.traces.modalBlocksGameplay, fixture);

    expect(result.frames[0]?.buttons[sinanGateActionIds.modalConfirm]).toMatchObject({
      isPressed: true,
      justPressed: true
    });
    expect(result.frames[0]?.buttons[sinanGateActionIds.runtimeInteract]).toMatchObject({
      isPressed: false,
      justPressed: false
    });
  });
});
