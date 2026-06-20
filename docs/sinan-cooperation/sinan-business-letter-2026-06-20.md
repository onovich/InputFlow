# Sinan Engine 给 InputFlow 的合作沟通函

日期：2026-06-20
发件方：Sinan Engine 商务与生态合作评估
收件方：InputFlow 项目负责人 / 维护者
关联 RFC：`rfc-002-sinan-input-context.md`

## 1. 来信目的

我们已将 Sinan 本地决策者批准的 `RFC-002：Sinan Input Context` 放入本目录。该 RFC 定义了 Sinan 对 InputAction、InputContext、InputMap、EngineLoop 集成、World/Event 映射和外部 backend 的当前边界。

这封信是商务侧补充说明：Sinan 希望邀请 InputFlow 成为输入方向的 first-party design partner，并从一个非常窄的 POC 开始。

## 2. Sinan 当前定位升级

InputFlow 现有文档中仍以 `Sinan Scene Director` 描述我们。这里同步最新定位：

Sinan 已经升级为 **Sinan Engine**，即 AI-native、data-first、Web 原生 3D 游戏引擎与编辑器。原先的 Scene Director 能力现在是引擎内部 Director System，和 EngineSession、World、RuntimeAdapter、Assets、Input、UI、Physics、Editor 一起组成 first-party engine systems。

这意味着输入系统不能再只是 viewport handler 或 editor 快捷键实现。它需要成为 Sinan 的 engine semantic contract，外部项目可以提供 browser/gamepad/touch/replay backend。

## 3. 我们为什么看重 InputFlow

Sinan 当前还没有完整 first-party InputSystem。随着 Showcase Mode、player control、runtime UI、pause menu、gameplay camera 和 browser smoke 进入路线，输入边界会直接影响：

- editor/gameplay mode 切换。
- modal、panel、text editing focus。
- pointer picking。
- camera look/orbit。
- replay / deterministic test。
- AI 自动验证。

InputFlow 文档中强调的原则和 Sinan 很一致：

- 宿主拥有时间和循环。
- Pull 为主，Event 为辅。
- 配置和运行时状态分离。
- 不使用隐式全局单例。
- React 只做低频投影。
- virtual input / replay 是第一等能力。

## 4. 合作方式

Sinan 会先保留最小 input contract，然后接入 InputFlow backend。我们建议第一阶段只做：

1. `runtime.gameplay.interact`
2. `editor.viewport.select`
3. modal / pause 隔离
4. virtual replay fixture
5. blur/focus reset diagnostics

暂时不做：

- 完整 rebinding UI。
- mobile virtual joystick。
- 复杂手势。
- 全部 editor 快捷键迁移。
- InputFlow 作为 Sinan hard dependency。

## 5. Sinan 与 InputFlow 的职责边界

Sinan 保留：

- action name。
- context priority。
- InputMap schema。
- EngineLoop 集成点。
- World/Event/Director/UI 映射。
- editor save/undo/command 规则。

InputFlow 可提供：

- keyboard / pointer / touch / gamepad source。
- binding resolution。
- rebind backend。
- virtual replay。
- diagnostics。
- browser/gamepad cross-browser test strategy。

InputFlow 不应直接：

- 修改 Sinan World。
- 调用 Sinan EventSystem action。
- 操作 Three.Camera。
- 读取 Sinan editor store。

## 6. 生态协同提示

Sinan 同期也在和几个 Web game infrastructure 项目对齐：

- Indirection：资源 catalog、asset report、fallback loader。
- ViewRig：camera rig / pose solver。
- LudoWeave：Runtime UI ViewModel、Prompt、Subtitle、Pause。

InputFlow 会成为这些合作的共同底层之一。Runtime UI 需要 focus 和 confirm/cancel，ViewRig 需要 look/orbit intent，Showcase gameplay 需要 interact/move/pause。我们希望 InputFlow 的 core 保持独立，同时让 Sinan 提供真实压力测试。

## 7. 希望 InputFlow 回复的问题

请优先评估：

1. 是否接受 Sinan 保留 action name 和 context priority？
2. `InputMap + interact/select + replay` 是否适合作为第一阶段 POC？
3. InputFlow 的 Sinan adapter 第一阶段是否同意放在 Sinan repo 内，待接口稳定后再拆为独立包？
4. virtual replay 的最小记录格式能否在不依赖真实 DOM 事件的情况下复现 Gate interaction？
5. 如何避免 InputFlow core 对 Sinan editor store、React 或 Three 产生反向依赖？

## 8. 商务边界

本函不是收购、合并或排他合作要约。当前阶段我们希望建立 first-party design partner 关系：

```txt
Sinan owns input semantics.
InputFlow owns specialized input backend.
POCs prove value.
Validation protects boundaries.
```

如果 POC 稳定、接口连续兼容、维护责任清晰，我们再讨论官方 adapter、兼容矩阵、Sinan Engine Infrastructure Kit 或更深层合作。
