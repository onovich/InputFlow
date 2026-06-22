import type { InputMapDefinition } from "@inputflow/core";
import { runReplayTrace, type ReplayTrace } from "./replay-runner.js";

export interface SinanGateAdapterContractFixture {
  readonly maps: readonly InputMapDefinition[];
  readonly traces: {
    readonly keyboardInteract: ReplayTrace;
    readonly pointerInteract: ReplayTrace;
    readonly gamepadInteract: ReplayTrace;
    readonly editorSelect: ReplayTrace;
    readonly modalBlocksGameplay: ReplayTrace;
    readonly pauseBlocksGameplay: ReplayTrace;
    readonly pauseReleaseRestoresGameplay: ReplayTrace;
  };
}

export const sinanGateActionIds = {
  runtimeInteract: "runtime.gameplay.interact",
  editorSelect: "editor.viewport.select",
  pauseConfirm: "runtime.pause.confirm",
  modalConfirm: "ui.modal.confirm"
} as const;

export const sinanGateMapIds = {
  gameplay: "gameplay",
  editorViewport: "editorViewport",
  pause: "pause",
  modal: "modal"
} as const;

export const createSinanGateAdapterContractFixture = (): SinanGateAdapterContractFixture => {
  const gameplayMap: InputMapDefinition = {
    id: sinanGateMapIds.gameplay,
    actions: [{ id: sinanGateActionIds.runtimeInteract, valueType: "button" }],
    bindings: [
      {
        id: "gameplay.interact.keyboard",
        action: sinanGateActionIds.runtimeInteract,
        source: { kind: "control", path: "<Keyboard>/code/KeyE" }
      },
      {
        id: "gameplay.interact.pointer",
        action: sinanGateActionIds.runtimeInteract,
        source: { kind: "control", path: "<Pointer>/button/primary" }
      },
      {
        id: "gameplay.interact.gamepad",
        action: sinanGateActionIds.runtimeInteract,
        source: { kind: "control", path: "<Gamepad>/button/south" }
      }
    ]
  };

  const modalMap: InputMapDefinition = {
    id: sinanGateMapIds.modal,
    actions: [{ id: sinanGateActionIds.modalConfirm, valueType: "button" }],
    bindings: [
      {
        id: "modal.confirm.keyboard",
        action: sinanGateActionIds.modalConfirm,
        source: { kind: "control", path: "<Keyboard>/code/KeyE" }
      },
      {
        id: "modal.confirm.pointer",
        action: sinanGateActionIds.modalConfirm,
        source: { kind: "control", path: "<Pointer>/button/primary" }
      }
    ]
  };

  const editorViewportMap: InputMapDefinition = {
    id: sinanGateMapIds.editorViewport,
    actions: [{ id: sinanGateActionIds.editorSelect, valueType: "button" }],
    bindings: [
      {
        id: "editor.viewport.select.pointer",
        action: sinanGateActionIds.editorSelect,
        source: { kind: "control", path: "<Pointer>/button/primary" }
      }
    ]
  };

  const pauseMap: InputMapDefinition = {
    id: sinanGateMapIds.pause,
    actions: [{ id: sinanGateActionIds.pauseConfirm, valueType: "button" }],
    bindings: [
      {
        id: "pause.confirm.keyboard",
        action: sinanGateActionIds.pauseConfirm,
        source: { kind: "control", path: "<Keyboard>/code/KeyE" }
      }
    ]
  };

  return {
    maps: [gameplayMap, modalMap, editorViewportMap, pauseMap],
    traces: {
      keyboardInteract: createGameplayPressTrace("<Keyboard>/code/KeyE"),
      pointerInteract: createGameplayPressTrace("<Pointer>/button/primary"),
      gamepadInteract: createGameplayPressTrace("<Gamepad>/button/south"),
      editorSelect: {
        schemaVersion: 1,
        kind: "raw-control-trace",
        clock: "relative-ms",
        events: [
          {
            t: 0,
            type: "context.activate",
            contextId: "editorViewport",
            priority: 500,
            maps: [sinanGateMapIds.editorViewport]
          },
          { t: 16, type: "control", control: "<Pointer>/button/primary", value: 1 },
          { t: 16, type: "frame" },
          { t: 32, type: "control", control: "<Pointer>/button/primary", value: 0 },
          { t: 32, type: "frame" }
        ]
      },
      pauseBlocksGameplay: {
        schemaVersion: 1,
        kind: "raw-control-trace",
        clock: "relative-ms",
        events: [
          {
            t: 0,
            type: "context.activate",
            contextId: "runtimeGameplay",
            priority: 400,
            maps: [sinanGateMapIds.gameplay]
          },
          {
            t: 0,
            type: "context.activate",
            contextId: "runtimePause",
            priority: 900,
            routing: "consumeMatched",
            maps: [sinanGateMapIds.pause]
          },
          { t: 16, type: "control", control: "<Keyboard>/code/KeyE", value: 1 },
          { t: 16, type: "frame" }
        ]
      },
      pauseReleaseRestoresGameplay: {
        schemaVersion: 1,
        kind: "raw-control-trace",
        clock: "relative-ms",
        events: [
          {
            t: 0,
            type: "context.activate",
            contextId: "runtimeGameplay",
            priority: 400,
            maps: [sinanGateMapIds.gameplay]
          },
          {
            t: 0,
            type: "context.activate",
            contextId: "runtimePause",
            priority: 900,
            routing: "consumeMatched",
            maps: [sinanGateMapIds.pause]
          },
          { t: 16, type: "control", control: "<Keyboard>/code/KeyE", value: 1 },
          { t: 16, type: "frame" },
          { t: 32, type: "control", control: "<Keyboard>/code/KeyE", value: 0 },
          { t: 32, type: "frame" },
          { t: 48, type: "context.deactivate", contextId: "runtimePause" },
          { t: 64, type: "control", control: "<Keyboard>/code/KeyE", value: 1 },
          { t: 64, type: "frame" }
        ]
      },
      modalBlocksGameplay: {
        schemaVersion: 1,
        kind: "raw-control-trace",
        clock: "relative-ms",
        events: [
          {
            t: 0,
            type: "context.activate",
            contextId: "runtimeGameplay",
            priority: 400,
            maps: [sinanGateMapIds.gameplay]
          },
          {
            t: 0,
            type: "context.activate",
            contextId: "editorModal",
            priority: 1000,
            routing: "consumeMatched",
            maps: [sinanGateMapIds.modal]
          },
          { t: 16, type: "control", control: "<Keyboard>/code/KeyE", value: 1 },
          { t: 16, type: "frame" }
        ]
      }
    }
  };
};

export const runSinanGateAdapterContractReplay = (
  trace: ReplayTrace,
  fixture: SinanGateAdapterContractFixture = createSinanGateAdapterContractFixture()
) => runReplayTrace({ maps: fixture.maps, trace });

const createGameplayPressTrace = (control: string): ReplayTrace => ({
  schemaVersion: 1,
  kind: "raw-control-trace",
  clock: "relative-ms",
  events: [
    {
      t: 0,
      type: "context.activate",
      contextId: "runtimeGameplay",
      priority: 400,
      maps: [sinanGateMapIds.gameplay]
    },
    { t: 16, type: "control", control, value: 1 },
    { t: 16, type: "frame" },
    { t: 32, type: "control", control, value: 0 },
    { t: 32, type: "frame" }
  ]
});
