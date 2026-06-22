# InputFlow v0.1 开发计划

> 日期：2026-06-20
> 状态：Execution plan draft
> 配套文档：`docs/InputFlow-Technical-Architecture-v0.1.md`
> 仓库 README：`README.md`
> Changelog / RC notes：`CHANGELOG.md`
> Goal 模式执行入口：`docs/InputFlow-Phase0-6-Goal-Mode-Execution-Guide.md`（Phase 0-6，24 轮）
> 下一阶段 Goal 入口：`docs/InputFlow-Phase7-Browser-Matrix-Goal-Mode-Execution-Guide.md`（Phase 7，16 轮）
> Phase 8 Goal 入口：`docs/InputFlow-Phase8-CI-Release-Gates-Goal-Mode-Execution-Guide.md`（Phase 8，16 轮）
> Phase 9 Goal 入口：`docs/InputFlow-Phase9-v0.1-Release-Candidate-Goal-Mode-Execution-Guide.md`（Phase 9，16 轮）
> Phase 10 Goal 入口：`docs/InputFlow-Phase10-Physical-Gamepad-Acceptance-Goal-Mode-Execution-Guide.md`（Phase 10，16 轮）
> Phase 11 Goal 入口：`docs/InputFlow-Phase11-Sinan-Adapter-POC-Handoff-Goal-Mode-Execution-Guide.md`（Phase 11，16 轮）
> Phase 12 Goal 入口：`docs/InputFlow-Phase12-v0.1-Release-Authorization-Goal-Mode-Execution-Guide.md`（Phase 12，16 轮）
> Phase 13 Goal 入口：`docs/InputFlow-Phase13-Owner-Decision-Application-Goal-Mode-Execution-Guide.md`（Phase 13，8 轮）
> Phase 12 release authorization packet: `docs/release/InputFlow-v0.1-Release-Authorization-Packet.md`
> Phase 12 owner decision matrix: `docs/release/InputFlow-v0.1-Owner-Decision-Matrix.md`
> Phase 12 package metadata audit: `docs/release/InputFlow-v0.1-Package-Metadata-Audit.md`
> Phase 12 remote CI evidence: `docs/release/InputFlow-v0.1-Remote-CI-Evidence.md`
> Phase 12 local release confidence: `docs/release/InputFlow-v0.1-Local-Release-Confidence.md`
> Phase 12 publish simulation and provenance notes: `docs/release/InputFlow-v0.1-Publish-Simulation-and-Provenance.md`
> Phase 12 rollback and deprecation policy: `docs/release/InputFlow-v0.1-Rollback-and-Deprecation-Policy.md`
> Phase 12 final release candidate audit: `docs/release/InputFlow-v0.1-Final-Release-Candidate-Audit.md`
> Phase 12 owner sign-off checklist: `docs/release/InputFlow-v0.1-Owner-Sign-Off-Checklist.md`
> Phase 12 release authorization check command: `pnpm release:authorization:check`
> Phase 13 owner decision record: `docs/release/InputFlow-v0.1-Owner-Decision-Record.md`
> Phase 13 owner decision status: `RELEASE_DEFERRED_DECISION_RECORDED`; real release deferred; exact public license remains blocking.
> Phase 11 Sinan handoff strategy：`docs/sinan-cooperation/inputflow-sinan-poc-handoff-strategy.md`
> Phase 11 Sinan fixture inventory：`docs/sinan-cooperation/inputflow-sinan-contract-fixture-inventory.md`
> Phase 11 Sinan blur reset scenario：`docs/sinan-cooperation/inputflow-sinan-blur-reset-scenario.md`
> Phase 11 Sinan diagnostics handoff: `docs/sinan-cooperation/inputflow-sinan-diagnostics-handoff.md`
> Phase 11 Sinan downstream acceptance checklist: `docs/sinan-cooperation/inputflow-sinan-downstream-acceptance-checklist.md`
> Phase 11 Sinan package export audit: `docs/sinan-cooperation/inputflow-sinan-package-export-audit.md`
> Phase 11 Sinan handoff packet: `docs/sinan-cooperation/inputflow-sinan-handoff-packet.md`
> Phase 11 Sinan contract check command: `pnpm sinan:contract:check`
> Browser smoke 指南：`docs/InputFlow-Browser-Smoke-Guide.md`
> CI troubleshooting 指南：`docs/InputFlow-CI-Troubleshooting.md`
> Remote CI observation 指南：`docs/InputFlow-Remote-CI-Observation-Guide.md`
> Phase 9 remote CI evidence：`docs/InputFlow-Phase9-Remote-CI-Evidence.md`
> Phase 9 package dry-run audit：`docs/InputFlow-Phase9-Package-Dry-Run-Audit.md`
> Manual Gamepad harness guide：`docs/InputFlow-Manual-Gamepad-Harness-Guide.md`
> Phase 10 physical Gamepad evidence：`docs/InputFlow-Phase10-Physical-Gamepad-Evidence.md`
> Manual Gamepad checklist：`docs/InputFlow-Manual-Gamepad-Release-Checklist.md`
> Phase 7 完成报告：`docs/InputFlow-Phase7-Final-Report.md`
> Phase 8 完成报告：`docs/InputFlow-Phase8-Final-Report.md`
> Phase 9 完成报告：`docs/InputFlow-Phase9-Final-Report.md`（draft）
> Phase 10 完成报告：`docs/InputFlow-Phase10-Final-Report.md`（complete）
> Phase 11 完成报告：`docs/InputFlow-Phase11-Final-Report.md`（complete）
> Phase 12 完成报告：`docs/InputFlow-Phase12-Final-Report.md`（complete）
> Phase 13 完成报告：`docs/InputFlow-Phase13-Final-Report.md`（planned）
> ADR 入口：`docs/adr/0001-package-manager.md`、`docs/adr/0002-host-semantics-boundary.md`、`docs/adr/0003-replay-first-class-contract.md`、`docs/adr/0004-context-lease-lifecycle.md`、`docs/adr/0005-schema-hot-path-boundary.md`、`docs/adr/0006-browser-matrix-strategy.md`、`docs/adr/0007-ci-release-gates.md`、`docs/adr/0008-v0.1-release-candidate-policy.md`、`docs/adr/0009-physical-gamepad-acceptance-policy.md`

---

## 1. v0.1 目标

v0.1 不追求覆盖所有设备和所有 UI，而是先把核心契约做硬：

```txt
ControlPath
  -> BindingGraph
  -> Interaction
  -> ActionSnapshot
  -> ContextLease routing
  -> Replay trace
```

第一版完成后，InputFlow 应能做到：

- core 无 DOM、React、Three、Sinan 依赖。
- VirtualInputSource 可在无浏览器环境中驱动 action snapshot。
- ContextLease 可以稳定隔离 gameplay、editor viewport、modal。
- Replay 可以无 DOM 复现一次 interact trace。
- Browser Source 可以接入 Keyboard E、Pointer Primary、basic Gamepad South。
- Schema / Override / Diagnostics 有明确结构。
- Sinan POC 可用 `runtime.gameplay.interact`、`editor.viewport.select`、modal isolation 验证边界。

---

## 2. 开发原则

1. 先核心闭环，后设备覆盖。
2. 先 Virtual / Replay，后 DOM。
3. 先 ContextLease，后复杂 UI focus。
4. 先 generic package contract，后 Sinan adapter。
5. 先机器可验证，后人工 demo。
6. React 和重绑定 UI 后置，不进入第一条纵切。

---

## 3. 里程碑总览

| 里程碑 | 名称 | 核心输出 | 阻塞后续 |
|---|---|---|---|
| M0 | 仓库与 ADR 基线 | workspace、包骨架、验证命令、ADR | 全部实现 |
| M1 | Core Button Slice | Virtual button 到 ButtonActionState | Context / Replay |
| M2 | ContextLease Routing | modal/gameplay 隔离 | Sinan POC |
| M3 | Replay Contract v0 | raw trace 到 action trace | AI smoke / deterministic tests |
| M4 | Axis / Composite / Processor | move 类 action | Gamepad / camera intent |
| M5 | Schema / Override / Diagnostics | 数据契约和错误模型 | 对外使用 |
| M6 | Browser Source | Keyboard / Pointer / blur reset | 浏览器 POC |
| M7 | Sinan POC Contract | Sinan adapter 契约和验收 | design partner 对齐 |
| M8 | v0.1 Hardening | package exports、docs、release dry-run | v0.1 发布 |

---

## 4. M0：仓库与 ADR 基线

目标：建立可实现、可验证、可协作的工程地基。

交付文件：

```txt
docs/adr/0001-package-manager.md
docs/adr/0002-host-semantics-boundary.md
docs/adr/0003-replay-first-class-contract.md
docs/adr/0004-context-lease-lifecycle.md
docs/adr/0005-schema-hot-path-boundary.md
package.json
tsconfig.base.json
packages/core/package.json
packages/core/src/index.ts
packages/schema/package.json
packages/schema/src/index.ts
packages/testing/package.json
packages/testing/src/index.ts
packages/browser/package.json
packages/browser/src/index.ts
```

包管理决策：

- 默认建议采用 `pnpm workspace`。
- 如果后续决定使用 npm workspaces，必须在 ADR 中写清楚原因。
- 不混用 pnpm 和 npm 的 workspace 心智模型。

命令基线：

```txt
typecheck
test
lint
build
validate
```

验收标准：

- root validate 命令可运行。
- 四个包可被 TypeScript project references 识别。
- core 包无 DOM / React / Three / Sinan import。
- 文档能说明为什么 Sinan adapter 暂不在本仓库创建。

建议提交：

```txt
chore: scaffold InputFlow workspace
```

---

## 5. M1：Core Button Slice

目标：在无 DOM 环境中跑通第一个 button action。

实现范围：

```txt
packages/core/src/
  ids.ts
  control-path.ts
  raw-event.ts
  raw-event-queue.ts
  device-state.ts
  binding-graph.ts
  action-state.ts
  interactions/press.ts
  input-flow.ts
  source.ts
  snapshot.ts

packages/testing/src/
  virtual-input-source.ts
  fake-clock.ts
```

最小 API：

```ts
const input = createInputFlow({ maps: [map] })
const virtual = new VirtualInputSource()

input.addSource(virtual)
input.activateContext({
  id: 'runtimeGameplay',
  priority: 400,
  routing: 'consumeMatched'
})

virtual.setButton('<Keyboard>/code/KeyE', true, 16)
input.update(16)

input.readButton('runtime.gameplay.interact')
```

测试：

- `justPressed` 在按下帧为 true。
- `isPressed` 在 held 帧为 true。
- `justReleased` 在释放帧为 true。
- 同一帧多次事件顺序稳定。
- key repeat 不重复产生 press edge。

验收标准：

- 所有测试不需要 DOM。
- 同一事件序列重复运行结果一致。
- Snapshot 读取不暴露可变内部状态。

建议提交：

```txt
feat(core): add deterministic button action slice
```

---

## 6. M2：ContextLease Routing

目标：实现可测试的上下文隔离，支撑 modal / pause / editor viewport。

实现范围：

```txt
packages/core/src/context-router.ts
packages/core/src/context-lease.ts
packages/core/src/diagnostics.ts
```

功能：

- `activateContext(options): ContextLease`
- `lease.dispose()`
- priority routing。
- `shared`
- `consumeMatched`
- `exclusive`
- active context debug snapshot。

测试：

- `modal` 高优先级屏蔽 `runtimeGameplay`。
- `modal.dispose()` 后 gameplay 恢复。
- `exclusive` 阻止低优先级 context。
- `shared` 不阻止低优先级 context。
- consumed control 出现在 diagnostics/debug snapshot 中。

验收标准：

- Context 不包含宿主 mode 逻辑。
- ContextId 只是 opaque string。
- lease dispose 幂等。

建议提交：

```txt
feat(core): add context lease routing
```

---

## 7. M3：Replay Contract v0

目标：把 deterministic replay 做成核心能力。

实现范围：

```txt
packages/testing/src/replay-runner.ts
packages/testing/src/action-trace.ts
packages/schema/src/replay-trace-schema.ts
```

trace v0 支持事件：

- `control`
- `context.activate`
- `context.deactivate`
- `frame`

测试：

- raw trace 可复现一次 `runtime.gameplay.interact`。
- replay runner 不读取真实时间。
- action snapshot trace 可用于断言。
- context lifecycle 可以被 trace 驱动。

验收标准：

- Replay 不依赖 DOM。
- 同一 map + trace 输出完全一致。
- trace 格式进入 schema 包。

建议提交：

```txt
feat(testing): add replay runner and action trace
```

---

## 8. M4：Axis / Composite / Processor

目标：补齐 move/look/orbit 类 action 所需的值模型。

实现范围：

```txt
packages/core/src/processors/
packages/core/src/interactions/
packages/core/src/composites/
```

功能：

- `axis1d`
- `axis2d`
- `composite1d`
- `composite2d`
- `maxMagnitude`
- `deadzone`
- `radialDeadzone`
- `normalize2d`
- `scale`
- `invert`
- `clamp`
- `tap`
- `hold`
- `repeat`

测试：

- WASD 输出 normalized axis2d。
- virtual gamepad axis 通过 deadzone。
- axis combine 不超过预期范围。
- repeat 使用注入时间，不依赖 OS key repeat。

验收标准：

- Processor 是纯函数。
- Interaction 只读取 frame time。
- axis snapshot 有 previous、delta、changed。

建议提交：

```txt
feat(core): add axis composites and processors
```

---

## 9. M5：Schema / Override / Diagnostics

目标：把配置事实源和错误模型稳定下来。

实现范围：

```txt
packages/schema/src/input-map-schema.ts
packages/schema/src/override-schema.ts
packages/schema/src/diagnostic-schema.ts
packages/core/src/override.ts
packages/core/src/diagnostics.ts
```

功能：

- InputMap schema。
- Override schema。
- migration hook。
- generic validation diagnostics。
- unresolved action。
- binding conflict。
- unknown control / processor / interaction。

测试：

- invalid map 产生结构化 error。
- invalid override 产生 warning，不静默应用。
- override 不复制 default map。
- schema 不被 frame update 调用。

验收标准：

- schema 包可单独使用。
- core frame hot path 不依赖 Zod。
- diagnostics 可被机器读取。

建议提交：

```txt
feat(schema): add input map and override validation
```

---

## 10. M6：Browser Source

目标：接入真实浏览器输入，同时保持 core 纯净。

实现范围：

```txt
packages/browser/src/keyboard-source.ts
packages/browser/src/pointer-source.ts
packages/browser/src/gamepad-source.ts
packages/browser/src/editable-target.ts
packages/browser/src/browser-source.ts
```

功能：

- Keyboard `code` / `key`。
- Pointer primary button。
- pointer position / target normalized。
- wheel per-frame accumulation。
- blur / visibility reset。
- editable target filter。
- attach / detach。
- basic Gamepad South button。

测试：

- Keyboard E 触发 button action。
- Pointer Primary 触发同一 action。
- editable target 聚焦时 gameplay shortcut 被过滤。
- blur 后 held state reset。
- detach 后 listener 被移除。

验收标准：

- browser 包可在无 DOM 环境安全 import。
- 只有 source attach 时访问 browser globals。
- core 包仍无 DOM import。

建议提交：

```txt
feat(browser): add keyboard and pointer sources
```

---

## 11. M7：Sinan POC Contract

目标：用 Sinan 真实场景验证边界，但不把 Sinan 代码放入 InputFlow core。

InputFlow 仓库交付：

```txt
docs/sinan-cooperation/inputflow-sinan-adapter-contract.md
packages/testing/src/adapter-contract.ts
examples/sinan-contract-fixtures/
```

POC 验收语义：

- `runtime.gameplay.interact`
- `editor.viewport.select`
- modal / pause isolation。
- virtual replay fixture。
- blur/focus reset diagnostics。

边界检查：

- InputFlow 不定义 Sinan action namespace。
- InputFlow 不定义 Sinan context priority。
- InputFlow 不调用 EventSystem / World / Three。
- Sinan adapter 第一阶段在 Sinan repo 内实现。

建议提交：

```txt
docs: define Sinan adapter contract
```

---

## 12. M8：v0.1 Hardening

目标：准备首个可发布版本。

任务：

- package exports。
- declaration output。
- source maps / declaration maps。
- bundle size check。
- TypeDoc。
- API examples。
- browser smoke matrix。
- release dry-run。
- changelog / changeset。

v0.1 Definition of Done：

- core 无 DOM、React、Three、Sinan 依赖。
- Browser Source 可 attach/detach。
- Virtual Source 可无 DOM 运行。
- Replay 可输出稳定 action snapshot trace。
- Keyboard、Pointer、basic Gamepad 可用。
- button、axis1d、axis2d 可用。
- ContextLease routing 有测试。
- blur reset 有测试。
- schema / override / diagnostics 有测试。
- Sinan Gate POC 可通过 E、Pointer、Virtual Replay 完成 interact。

建议提交：

```txt
chore: prepare v0.1 release baseline
```

---

## 13. 下一批开发任务

下一轮应该直接进入 M0。建议按以下顺序实现：

1. 创建 ADR 目录和五份 ADR 草案。
2. 选择 package manager，并创建 workspace 文件。
3. 创建四个包的 `package.json` 和 `src/index.ts`。
4. 创建 root TypeScript / test / build 配置。
5. 配置 `validate` 命令。
6. 更新项目 ops workflow，让后续 Codex 可以直接运行 validate。
7. 提交并推送仓库基线。

完成 M0 后，立刻进入 M1 的 `VirtualInputSource -> ButtonActionState` 第一条纵切。

---

## 14. 当前明确不做

v0.1 前不做：

- 完整重绑定 UI。
- React diagnostics 正式包。
- mobile virtual joystick。
- 复杂多指手势。
- 完整本地多人设备配对。
- pointer picking / world ray / entity hit。
- Sinan editor command 全量迁移。
- `@inputflow/sinan` 独立包。
- 将 InputFlow 作为 Sinan hard dependency。

---

## 15. 风险检查清单

每个里程碑完成前都检查：

- 是否引入了宿主语义到 core？
- 是否让 DOM event handler 直接改变业务可见 edge state？
- 是否把 schema validation 放进 frame hot path？
- 是否让 React 承载高频输入状态？
- 是否让 Replay 依赖真实浏览器事件？
- 是否遗漏了 blur / detach reset？
- 是否破坏了 Sinan fallback InputSystem 的可能性？
