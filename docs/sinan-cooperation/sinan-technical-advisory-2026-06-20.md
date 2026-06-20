# Sinan 技术顾问建议：InputFlow

> 日期：2026-06-20
> 角色：Sinan Engine 领头技术顾问视角
> 阅读对象：InputFlow 项目负责人、架构负责人、后续 Sinan adapter 负责人
> 依据文档：`docs/InputFlow-Design-Document-v0.1.md`、`docs/sinan-cooperation/rfc-002-sinan-input-context.md`

## 1. 总体判断

InputFlow 的设计方向是正确的：它没有把输入系统理解成 DOM event wrapper，而是理解成“原始输入到宿主语义动作之间的确定性路由层”。这对 Sinan 非常重要，因为 Sinan 后续 Showcase Mode、player controller、runtime UI、pause menu、camera control、AI smoke replay 都需要稳定输入快照，而不能继续把输入散落在 React component、viewport handler 和临时 DOM listener 里。

但 InputFlow 也最容易越界。输入系统天然靠近 mode、focus、world interaction、editor command、UI navigation 和 camera control。如果 InputFlow 试图定义宿主 action 命名、engine mode、editor focus policy 或 world picking，它就会从基础设施变成宿主框架，反而失去跨项目价值。

建议定位保持为：

```txt
InputFlow owns raw input normalization, binding evaluation, interactions, replay.
Host owns action names, mode/context meaning, world/editor/UI consequences.
```

对 Sinan 来说，InputFlow 应该作为 backend 或 library 接入 Sinan first-party `InputSystem`，而不是直接成为 Sinan 的 `InputSystem`。

## 2. 架构建议

### 2.1 把 action id 设计成 opaque string

InputFlow 不应内置 `gameplay.interact`、`editor.viewport.select` 这类宿主语义。它可以处理这些字符串，但不能拥有它们。

建议 API 思路：

```ts
type ActionId = string & { readonly __brand?: 'ActionId' };
```

InputFlow 只保证：

- action id 可索引。
- binding 可以指向 action id。
- snapshot 可以读取 action state。
- diagnostics 可以报告 unresolved action。

至于 action 的业务含义，由 Sinan 或其他宿主定义。

### 2.2 Context 要支持 lease，而不是只支持 setActive

输入上下文最复杂的地方不是优先级表，而是生命周期。Modal 打开、文本输入聚焦、viewport capture、pointer lock、pause menu、debug overlay 都可能临时抢占输入。

建议设计 `ContextLease`：

```ts
const lease = input.activateContext('modal', {
  owner: 'pause-menu',
  priority: 100,
  consume: 'matched'
});

lease.dispose();
```

好处：

- 生命周期明确。
- 多个 modal 或 overlay 不会互相覆盖。
- 测试可以断言 lease dispose 后输入恢复。
- browser blur 时可以统一清理 transient lease 或 reset state。

### 2.3 Frame ownership 必须完全属于宿主

设计文档已经强调 InputFlow 不启动 RAF，这点必须坚持。建议核心 API 保持：

```ts
input.beginFrame(frameTime);
input.update();
const snapshot = input.snapshot();
input.endFrame();
```

也可以合并为 `update(now)`，但语义上要清楚：所有边沿状态只在宿主 frame 边界推进。不要让 DOM event handler 直接改变 `justPressed` 可见结果。

### 2.4 Replay 是一等能力，不是测试附属品

对 Sinan 来说，InputFlow 最大的合作价值之一是 Virtual Input 和 Replay。建议把 replay 放到 v0.1 关键路径，而不是 Phase 3 之后才补。

最小 replay 应支持：

- 注入 clock。
- 注入 control path value。
- 记录 context activate/deactivate。
- 输出 action snapshot trace。
- 同一 replay 在同一 input map 下稳定复现。

Sinan 的 Gate interaction smoke 可以直接依赖这个能力完成无人工交互测试。

### 2.5 Pointer picking 不要进入 core

InputFlow 可以输出 pointer target position、normalized position、buttons、delta、wheel，但不要输出 ray、hit entity 或 world object。

正确边界是：

```txt
InputFlow pointer snapshot
  -> Sinan Runtime / Viewport projection
  -> WorldQuery / Picking
  -> EventSystem receives interact/select intent
```

如果 InputFlow core 开始知道 camera、viewport scene、entity id，就会被宿主污染。

## 3. 技术栈建议

### 3.1 建议使用 pnpm workspace 或明确 npm workspace 原因

设计文档提到 npm workspaces。这个选择可以成立，但四个合作项目中其他项目更倾向 pnpm workspace。建议项目方尽快统一判断：

- 如果目标是严格依赖边界、多包发布、和其他基础设施项目一致，建议用 pnpm。
- 如果目标是最小工具链和 npm 原生体验，可以保留 npm workspaces。

无论选择哪一个，都不要在 v0.1 中混用两套 workspace 心智模型。

### 3.2 包拆分建议

建议首批包：

```txt
@inputflow/core
@inputflow/schema
@inputflow/testing
@inputflow/browser
```

`@inputflow/react` 可以后置。React 对 InputFlow 来说只是 diagnostics 和设置 UI，不应进入第一条纵切。

### 3.3 core 零 DOM、零 React、零 Three

必须坚持：

- core 不访问 `window`。
- core 不访问 `document`。
- core 不访问 `navigator.getGamepads()`。
- core 不 import React。
- core 不 import Three。
- core 不持久化到 localStorage。

所有平台行为都通过 Source 或 HostAdapter 注入。

### 3.4 schema 包不要进入热路径

Input Map 和 Override 需要 schema、migration、diagnostics，但 frame update 不应该依赖 Zod 或 Ajv。建议：

```txt
load time:
  schema validate -> migrate -> compile BindingGraph

frame time:
  compiled graph + device state -> snapshot
```

这样 editor 可以严格，runtime 可以轻。

## 4. 与 Sinan 的合作建议

### 4.1 Sinan 先定义最小 Input Contract

Sinan 会保留：

- action names。
- context priority。
- EngineLoop integration。
- World/Event/Editor mapping。
- inputMap source-of-truth。

InputFlow 应提供：

- raw input source。
- binding compiler。
- processor/interaction。
- snapshot。
- replay。
- diagnostics。

所以第一阶段不要要求 Sinan 把 input ownership 交给 InputFlow。合作切片应该是：

```txt
Sinan InputSystem facade
  -> InputFlow backend adapter
  -> Browser / Virtual / Replay source
```

### 4.2 Sinan POC 建议

建议按这个顺序：

1. **Core + Virtual Source**
   - 无浏览器。
   - 单个 button action。
   - `justPressed`、`held`、`justReleased` 稳定。

2. **Context Routing**
   - `runtimeGameplay`、`editorViewport`、`modal`。
   - modal 可屏蔽 gameplay。
   - dispose 后恢复。

3. **Browser Source**
   - Keyboard E。
   - Pointer primary。
   - browser blur reset。

4. **Replay Gate Interaction**
   - replay 一次 `runtime.gameplay.interact`。
   - Sinan Gate Demo smoke 可复现。

Gamepad 可以在 Keyboard/Pointer/Virtual 稳定后加入，不要成为第一步阻塞。

### 4.3 Sinan 最关心的验收

InputFlow adapter 进入 Sinan 主线前至少要满足：

- 不定义 Sinan action namespace。
- 不定义 Sinan EngineMode。
- 不直接调用 EventSystem action。
- 不直接操作 World transform。
- 不直接操作 Three camera。
- text input 聚焦时 gameplay shortcut 不触发。
- browser blur 后没有卡键。
- replay 可稳定复现。
- diagnostics 可机器读取。

## 5. 实现优先级

### Stage A：Core Button Slice

- ControlPath parser。
- RawEventQueue。
- DeviceState。
- BindingGraph。
- ButtonActionState。
- VirtualSource。
- injected clock。
- press/release edge tests。

### Stage B：Context Slice

- Context stack。
- priority。
- consume policy。
- lease lifecycle。
- modal isolation tests。

### Stage C：Axis And Composite

- axis1d / axis2d。
- composite1d / composite2d。
- deadzone / normalize2d。
- maxMagnitude combine。

### Stage D：Browser Source

- Keyboard source。
- Pointer source。
- wheel。
- focus/blur/visibility reset。
- editable target filter。

### Stage E：Replay And Sinan POC

- recorder。
- replay runner。
- action trace assertion。
- Gate interaction smoke。

## 6. 最大风险

### 风险一：输入系统变成宿主框架

如果 InputFlow 开始拥有 mode、world picking、camera control、UI modal stack，就会失去独立性。建议每个 API 都问一句：这是浏览器输入问题，还是宿主语义问题？

### 风险二：Context 语义过于隐式

如果只暴露 `setActiveContext()`，后续 modal、text editing、pointer capture 之间很容易产生幽灵状态。建议尽早引入 lease 和 debug snapshot。

### 风险三：重绑定 UI 过早

重绑定 UI 很吸引人，但 v0.1 更该先证明 map/override/migration/replay。UI 可以作为 example，不要让它定义 core。

## 7. 建议的 v0.1 Definition of Done

InputFlow v0.1 建议满足：

- core 无 DOM、React、Three 依赖。
- Browser source 可 attach/detach。
- Virtual source 可无浏览器运行。
- Keyboard、Pointer、基本 Gamepad button 可用。
- button、axis1d、axis2d 可用。
- Context priority 和 lease 有测试。
- blur/visibility reset 有测试。
- InputMap 和 Override 有 schema/migration。
- Replay 能稳定输出 action snapshot trace。
- React 只作为 diagnostics/example。
- Sinan Gate Demo 能通过 E、Pointer、Virtual Replay 触发 interact。

## 8. 给项目方的一句话建议

InputFlow 的第一版不要追求“支持所有设备”，而要先把 `ControlPath -> Binding -> Interaction -> ActionSnapshot -> ContextRouting -> Replay` 这条链做成硬契约。只要这条链稳定，Gamepad、touch、重绑定 UI、Sinan adapter 和其他宿主都会自然长出来。
