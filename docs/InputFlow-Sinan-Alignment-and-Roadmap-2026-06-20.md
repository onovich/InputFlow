# InputFlow 与 Sinan 对齐评估和研发计划

> 日期：2026-06-20
> 状态：Internal alignment draft
> 输入材料：
>
> - `docs/sinan-cooperation/rfc-002-sinan-input-context.md`
> - `docs/sinan-cooperation/sinan-technical-advisory-2026-06-20.md`
> - `docs/sinan-cooperation/sinan-business-letter-2026-06-20.md`
> - `docs/InputFlow-Design-Document-v0.1.md`

---

## 1. 结论摘要

Sinan 提供的 RFC、技术建议和商务函整体合理，且与 InputFlow 原始设计中的核心边界兼容。它们最重要的价值不是要求 InputFlow 改成 Sinan 子系统，而是明确提醒：Sinan 已升级为 **Sinan Engine**，会保留引擎输入语义、上下文优先级和 EngineLoop 集成所有权；InputFlow 应作为独立输入 backend/runtime library，提供原始输入标准化、Binding 计算、Interaction、Replay、Diagnostics 和跨设备适配能力。

InputFlow 应接受 Sinan 作为 first-party design partner，但不能接受成为 Sinan hard dependency 或反向绑定 Sinan 内部 World、EventSystem、Editor Store、React 或 Three.js。

研发计划需要调整：

- 将 `ActionId` 明确改为 opaque string，InputFlow 不拥有宿主 action namespace。
- 将 Context 模型明确为 generic routing primitive，优先实现 `ContextLease` 生命周期，而不是硬编码宿主 mode。
- 将 Replay / Virtual Input 提前到 v0.1 关键路径，不再作为后期测试附属能力。
- 将 React adapter 后置，v0.1 第一条纵切只保留 core、schema、testing、browser。
- 将 Sinan adapter 第一阶段放在 Sinan 仓库内，InputFlow 仓库只维护通用契约和 contract tests。
- 更新文档表述：Sinan 不再只是 `Scene Director`，而是 `Sinan Engine`；Scene Director 是其内部 Director System。

---

## 2. 对 Sinan 材料的合理性判断

### 2.1 RFC-002 合理

RFC 把 Sinan 输入划分为两层：

```txt
Sinan Input Contract
  action names, input contexts, InputMap schema, EngineLoop integration, World/Event mapping

Input Backend / Partner Implementation
  browser raw input, gamepad, touch, rebind, virtual replay, diagnostics
```

这个划分合理。Sinan 是引擎，必须拥有 gameplay/editor/UI 的语义；InputFlow 是基础设施，应该拥有跨设备输入处理和确定性快照能力。两者如果边界反过来，InputFlow 会过度宿主化，Sinan 也会失去 first-party engine contract。

需要澄清的一点是 `InputMap schema`。Sinan 可以拥有自己的项目级 InputMap schema 和数据位置，但 InputFlow 也需要维护通用的 BindingMap / Override schema。合理边界应是双层：

```txt
Sinan project InputMap schema
  host action names, context names, project policy
  -> adapter / loader
InputFlow generic map schema
  actions as opaque strings, bindings, processors, interactions, overrides
```

这样 Sinan 仍是项目事实源，InputFlow 仍能保持跨宿主复用。

### 2.2 技术顾问建议合理，且应采纳

技术建议中最关键的判断是：

```txt
InputFlow owns raw input normalization, binding evaluation, interactions, replay.
Host owns action names, mode/context meaning, world/editor/UI consequences.
```

这应成为 InputFlow v0.1 的正式边界原则。尤其要采纳以下建议：

- `ActionId` 是 opaque string，只做索引、绑定、快照和诊断，不解释业务含义。
- Context 使用 lease 管理生命周期，避免 modal、pause menu、pointer capture、debug overlay 互相覆盖。
- 宿主拥有 frame ownership，DOM event handler 不能直接让 `justPressed` 对业务可见。
- Replay 是一等能力，应支持注入 clock、control value、context activate/deactivate 和 action snapshot trace。
- Pointer picking 不进入 core；InputFlow 输出 pointer snapshot，world ray / entity hit 由宿主完成。
- 首批包应是 `core`、`schema`、`testing`、`browser`，React 后置。

包管理建议需要形成 ADR。当前仓库尚未 scaffold，切换成本为零。建议默认倾向 `pnpm workspace`，理由是多包边界更严格，也更贴近同期 Web game infrastructure 项目的协同方向；如果后续 Sinan 主仓库强约束 npm，则以 ADR 明确选择 npm。关键是不混用两套 workspace 心智模型。

### 2.3 商务函合理，但不能扩大为排他绑定

商务函明确不是收购、合并或排他合作要约，而是 design partner 关系。这对 InputFlow 是合理合作方式：

- Sinan 提供真实压力测试和 POC 验收场。
- InputFlow 保持独立项目和跨宿主价值。
- 双方通过窄 POC 验证价值，再讨论官方 adapter 或更深合作。

第一阶段范围也合理：

- `runtime.gameplay.interact`
- `editor.viewport.select`
- modal / pause 隔离
- virtual replay fixture
- blur/focus reset diagnostics

这些目标足够窄，能验证核心契约，又不会把重绑定 UI、移动虚拟摇杆、复杂手势、全部快捷键迁移等高风险工作提前拉进来。

---

## 3. InputFlow 需要做出的项目调整

### 3.1 定位调整

原定位保持不变：InputFlow 是独立 Web 输入基础设施。新增表述：

```txt
InputFlow is a host-neutral input backend/runtime library.
Hosts own input semantics; InputFlow owns deterministic input mechanics.
```

Sinan 相关表述从 `Sinan Scene Director` 更新为 `Sinan Engine`。Scene Director 只作为 Sinan 内部 Director System 被引用。

### 3.2 API 边界调整

v0.1 API 必须体现以下边界：

```ts
type ActionId = string & { readonly __brand?: 'ActionId' }
type ContextId = string & { readonly __brand?: 'ContextId' }
```

InputFlow 可以：

- 编译 action binding。
- 读取 action snapshot。
- 报告 unresolved action / binding conflict diagnostics。
- 根据 host 传入的 context priority 执行路由。

InputFlow 不可以：

- 内置 Sinan action namespace。
- 定义 Sinan EngineMode。
- 直接触发 Sinan EventSystem。
- 修改 World transform。
- 操作 Three.Camera。
- 读取 React store 或 editor store。

### 3.3 Context 调整

Context 不只是 `setActiveContext()`，而应是可释放的 lease：

```ts
const lease = input.activateContext({
  id: 'modal',
  owner: 'pause-menu',
  priority: 1000,
  routing: 'consumeMatched',
  focus: 'global'
})

lease.dispose()
```

设计要求：

- lease dispose 后输入恢复可测试。
- 多个 overlay / modal 不互相覆盖。
- debug snapshot 能显示 active context stack 和 owner。
- replay 可以记录 context activate/deactivate，或宿主可以在同一时间点确定性重建。

### 3.4 Replay 调整

Replay 从原 Phase 3 提前到核心路径。最小格式应支持无 DOM 复现：

```json
{
  "schemaVersion": 1,
  "kind": "raw-control-trace",
  "clock": "relative-ms",
  "events": [
    { "t": 0, "type": "context.activate", "contextId": "runtimeGameplay" },
    { "t": 16, "type": "control", "control": "<Keyboard>/code/KeyE", "value": 1 },
    { "t": 32, "type": "control", "control": "<Keyboard>/code/KeyE", "value": 0 },
    { "t": 48, "type": "context.deactivate", "contextId": "runtimeGameplay" }
  ]
}
```

v0.1 至少要能输出 action snapshot trace，用于断言同一 input map 下结果稳定。

### 3.5 包拆分调整

首批包改为：

```txt
@inputflow/core
@inputflow/schema
@inputflow/testing
@inputflow/browser
```

后置：

```txt
@inputflow/react
@inputflow/sinan
```

`@inputflow/sinan` 不在第一阶段创建。Sinan adapter 第一阶段放在 Sinan 仓库内，待接口稳定后再拆出。

### 3.6 POC 策略调整

POC 不以“完整设备覆盖”为目标，而以“契约闭环”为目标：

```txt
ControlPath
  -> Binding
  -> Interaction
  -> ActionSnapshot
  -> ContextLease routing
  -> Replay trace
```

Keyboard、Pointer、Virtual 优先于完整 Gamepad。Gamepad v0.1 只保留 South button / basic axis 的最低验证，不阻塞第一条纵切。

---

## 4. 回复 Sinan 的五个问题

1. **是否接受 Sinan 保留 action name 和 context priority？**
   接受。InputFlow 把 action/context 当作 opaque id 和 generic routing input，不拥有 Sinan 语义。

2. **`InputMap + interact/select + replay` 是否适合作为第一阶段 POC？**
   适合。它能同时验证 button、pointer、context isolation、snapshot 和 deterministic replay，是足够窄但有代表性的切片。

3. **Sinan adapter 第一阶段是否同意放在 Sinan repo 内？**
   同意。InputFlow 仓库提供通用包、contract tests 和 adapter contract；Sinan repo 内实现 first-party adapter，稳定后再评估独立 `@inputflow/sinan`。

4. **virtual replay 是否能不依赖真实 DOM 复现 Gate interaction？**
   能。前提是 replay 记录标准化 control path、value、clock 和必要的 context lifecycle，而不是记录原始 DOM event。

5. **如何避免 core 对 Sinan editor store、React 或 Three 反向依赖？**
   通过包边界、dependency policy、contract tests 和 CI 禁止 core 访问 DOM / React / Three / Sinan imports。所有宿主行为通过 adapter 输入输出。

---

## 5. 重新梳理后的研发计划

### Stage 0：对齐与仓库基线

目标：把合作边界和工程基线固定下来。

交付：

- 更新项目 README / 设计文档摘要中的 Sinan 命名：`Sinan Engine`。
- 新增 ADR：package manager 选择，默认建议 `pnpm workspace`。
- 新增 ADR：host semantics boundary。
- 新增 ADR：Replay first-class contract。
- 建立 monorepo scaffold。
- 建立 `core`、`schema`、`testing`、`browser` 包骨架。
- 建立 typecheck、unit test、lint、build 基础命令。

验收：

- root workspace 可安装、构建、测试。
- `@inputflow/core` 无 DOM / React / Three / Sinan 依赖。
- CI 或本地验证能检查包边界。

### Stage 1：Core Button Slice

目标：跑通最小 deterministic action。

交付：

- `ControlPath` parser / interner。
- `RawInputEvent` 和 `RawEventQueue`。
- `DeviceState`。
- `BindingGraph` 最小编译。
- `ButtonActionState`。
- `VirtualInputSource`。
- injected clock。
- `press` interaction。

验收：

- `E` press/release 产生稳定 `justPressed`、`isPressed`、`justReleased`。
- DOM 不参与测试。
- 同一 trace 多次运行得到相同 snapshot。

### Stage 2：Context Lease Routing

目标：解决 Sinan 最关心的 mode / modal / gameplay 隔离。

交付：

- `ContextLease`。
- context priority。
- `shared`、`consumeMatched`、`exclusive` routing。
- focus tag 输入。
- active context debug snapshot。

验收：

- modal lease 激活时屏蔽 runtime gameplay interact。
- lease dispose 后 gameplay 恢复。
- 同一 control 可被高优先级 context 消费且诊断可见。

### Stage 3：Replay Contract v0

目标：把 replay 从测试工具提升为核心契约。

交付：

- raw control trace 格式。
- context activate/deactivate event。
- replay runner。
- action snapshot trace 输出。
- trace assertion helper。

验收：

- 无 DOM 复现一次 `runtime.gameplay.interact`。
- 同一 input map 和 trace 产生稳定 action snapshot sequence。
- trace 可作为 Sinan Gate interaction smoke 的输入。

### Stage 4：Axis、Composite 和 Processor

目标：补齐 v0.1 输入表达能力。

交付：

- `axis1d`、`axis2d`。
- `composite1d`、`composite2d`。
- `maxMagnitude` combine。
- `deadzone`、`radialDeadzone`、`normalize2d`、`scale`、`invert`、`clamp`。
- `tap`、`hold`、`repeat`。

验收：

- WASD 产生稳定 axis2d。
- gamepad-like virtual axis 可通过 deadzone。
- processor 和 interaction 不读取全局时间或随机数。

### Stage 5：Schema、Override 和 Diagnostics

目标：把配置事实源、迁移和错误模型纳入可发布契约。

交付：

- generic InputFlow map schema。
- override schema。
- migration hook。
- structured diagnostics。
- unresolved action / unknown control / binding conflict 报告。

验收：

- schema 包不进入 frame hot path。
- override 不复制整份 default map。
- 无法定位的 override 产生 warning，不静默应用。

### Stage 6：Browser Source

目标：接入真实浏览器输入，但不让浏览器事件污染核心。

交付：

- Keyboard source。
- Pointer source。
- wheel 按帧累计。
- blur / visibility reset。
- editable target filter。
- attach / detach lifecycle。

验收：

- Keyboard `E` 和 Pointer Primary 可触发同一 action。
- input / textarea 聚焦时 gameplay shortcut 不触发。
- browser blur 后没有 held state 卡住。
- core 仍可在无 DOM 环境 import。

### Stage 7：Sinan POC Contract

目标：完成 first-party design partner 的最小闭环。

交付：

- InputFlow 侧 adapter contract tests。
- Sinan repo 内 adapter 协作说明。
- `runtime.gameplay.interact` POC。
- `editor.viewport.select` POC。
- modal / pause 隔离 POC。
- virtual replay fixture。

验收：

- InputFlow 不定义 Sinan action namespace。
- InputFlow 不定义 Sinan context priority。
- InputFlow 不调用 EventSystem / World / Three。
- Sinan fallback InputSystem 可以继续运行。

### Stage 8：v0.1 Hardening

目标：准备 v0.1 发布质量。

交付：

- basic Gamepad South button。
- basic gamepad axis fixture。
- browser cross-engine smoke strategy。
- bundle size check。
- TypeDoc / API examples。
- package exports。
- release dry-run。

验收：

- `@inputflow/core` 零运行时依赖。
- Browser source 可独立 attach/detach。
- Virtual / Replay 可无浏览器运行。
- Keyboard、Pointer、basic Gamepad 可用。
- Context lease、blur reset、schema、override、replay 都有测试。
- Sinan Gate Demo 可通过 E、Pointer、Virtual Replay 完成 interact。

---

## 6. 当前不做的事情

v0.1 之前不做：

- 完整重绑定 UI。
- React diagnostics panel 正式包。
- mobile virtual joystick。
- 复杂多指手势。
- 完整本地多人设备配对。
- pointer picking / world ray / entity hit。
- Sinan editor command 全量迁移。
- `@inputflow/sinan` 独立发布包。
- 把 InputFlow 作为 Sinan hard dependency。

---

## 7. 风险和控制措施

| 风险 | 影响 | 控制措施 |
|---|---|---|
| InputFlow 过度 Sinan 化 | 失去跨宿主价值 | ActionId opaque、无 Sinan imports、adapter 放 Sinan repo |
| Context 生命周期隐式 | modal / overlay / text editing 产生幽灵状态 | ContextLease、debug snapshot、lease dispose tests |
| Replay 后置 | 无法支撑 Sinan smoke 和 AI 自动验证 | Stage 3 提前 replay contract |
| React UI 过早 | 高频输入状态进入 UI 体系 | React adapter 后置，仅 diagnostics/example |
| Gamepad 范围膨胀 | 阻塞核心契约 | basic South button / axis fixture，不做完整配对 |
| Schema 进入热路径 | 性能和 bundle 受影响 | load-time validation，frame-time compiled graph |

---

## 8. 下一步建议

立即进入 Stage 0。第一批工程提交建议只做：

1. monorepo scaffold。
2. package manager ADR。
3. host semantics boundary ADR。
4. core/testing/schema/browser 空包和 project references。
5. 最小 validate 命令。

随后用 Stage 1 完成 `VirtualInputSource -> button action snapshot` 第一条纵切。这个纵切比先接 DOM 更重要，因为它能证明 InputFlow 的确定性契约，而不是只证明浏览器 listener 能工作。
