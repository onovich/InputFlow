# InputFlow Phase 0-6 Goal 模式执行指南

> 日期：2026-06-20
> 状态：给执行者使用的 Phase 0-6 大 Goal 开发指令文档
> 总轮次预算：24 轮
> 轮次分配：1-20 轮主实现，21-23 轮缓冲修复，24 轮最终验收
> 目标范围：从工程基线到 Sinan POC + v0.1 hardening，覆盖 Phase 0-6

---

## 0. 直接给执行者的 Goal Prompt

你正在 InputFlow 仓库中以 Goal 模式执行 Phase 0-6 大目标。请完整阅读本指南和必读上下文，然后按轮次推进，直到 Phase 0-6 全部完成或遇到无法绕开的真实阻塞。

目标是把 InputFlow 从当前文档设计状态推进到 v0.1 可验收的实现基线：

```txt
Phase 0: 仓库与工程基线
Phase 1: Core Button Slice
Phase 2: ContextLease + Routing
Phase 3: Replay Contract v0
Phase 4: Axis / Composite / Schema
Phase 5: Browser Source
Phase 6: Sinan POC + v0.1 Hardening
```

执行规则：

- 每一轮都必须有 Debug 自检、架构自检、验证命令与结果。
- 每一轮相关验证通过后，必须提交并推送该轮成果。
- 验证失败不得提交推送，不得进入下一轮。
- 提交失败或推送失败不得进入下一轮。
- 不要 stage 或修改无关用户文件。
- 不要把 Sinan 语义、React、Three、DOM 全局访问引入 `@inputflow/core`。
- 优先完成确定性链路：`VirtualInputSource -> ActionSnapshot -> ContextLease -> Replay trace`。

完成后输出最终报告，说明每个 Phase 的 PASS 证据、commit hash、推送结果、剩余风险和下一步建议。

---

## 1. 必读上下文

执行前必须阅读：

- `AGENTS.md`
- `docs/InputFlow-Design-Document-v0.1.md`
- `docs/InputFlow-Sinan-Alignment-and-Roadmap-2026-06-20.md`
- `docs/InputFlow-Technical-Architecture-v0.1.md`
- `docs/InputFlow-Development-Plan-v0.1.md`
- `docs/sinan-cooperation/rfc-002-sinan-input-context.md`
- `docs/sinan-cooperation/sinan-technical-advisory-2026-06-20.md`
- `docs/sinan-cooperation/sinan-business-letter-2026-06-20.md`
- `docs/codex-git-workflow.md`
- `docs/codex-ops-workflow.md`

当前已接受状态：

- 初始仓库已经创建并推送到 `origin/main`。
- 设计文档和 Sinan 合作材料已进入本地工作区。
- Phase 0-6 已被视为一个大 Goal。

下一候选阶段：

- 从 Phase 0 开始执行，因为当前还没有 workspace scaffold、ADR、包骨架或 validate 命令。

---

## 2. 本阶段要完成什么

Phase 0-6 大 Goal 完成后，仓库应具备：

- 可运行的 workspace 和四个首批包：`core`、`schema`、`testing`、`browser`。
- ADR 固化 package manager、host semantics boundary、Replay first-class、ContextLease lifecycle、schema hot-path boundary。
- `@inputflow/core` 实现 deterministic button / axis / context / snapshot / diagnostics 基线。
- `@inputflow/testing` 实现 VirtualInputSource、fake clock、replay runner、action trace assertion。
- `@inputflow/schema` 实现 InputMap、Override、Replay trace 和 diagnostics schema。
- `@inputflow/browser` 实现 Keyboard、Pointer、blur reset、editable filter 和 basic Gamepad。
- Sinan adapter contract 文档和 contract fixture。
- v0.1 hardening 基线：exports、types、docs、release dry-run 或等价发布检查。
- 根级 `validate` 命令可作为每轮主要验证入口。

核心验收链路：

```txt
ControlPath
  -> BindingGraph
  -> Interaction
  -> ActionSnapshot
  -> ContextLease routing
  -> Replay trace
  -> Browser Source
  -> Sinan POC contract
```

---

## 3. 本阶段不做什么

Phase 0-6 不做：

- 完整重绑定 UI。
- React diagnostics 正式包。
- mobile virtual joystick。
- 复杂多指手势。
- 完整本地多人设备配对。
- pointer picking、world ray、entity hit。
- Sinan editor command 全量迁移。
- 独立发布 `@inputflow/sinan`。
- 将 InputFlow 作为 Sinan hard dependency。
- 在 `@inputflow/core` 中访问 `window`、`document`、`navigator`、React、Three 或 Sinan 内部 store。

---

## 4. 每轮固定工作流

每轮开始：

1. 阅读本指南当前轮次目标。
2. 运行或查看 `git status --short --branch`。
3. 确认是否存在无关用户改动。
4. 如有无关改动，不要 stage；必要时在本轮报告中说明。
5. 阅读本轮涉及的最小上下文文件。

每轮实现：

1. 优先小步提交，保持范围贴合当前轮次。
2. 若发现阶段拆分不合理，优先保持架构边界，不扩大范围。
3. 新增代码必须有对应测试或验证。
4. 文档调整必须保持 UTF-8 无 BOM。

每轮结束：

1. 运行本轮相关验证。
2. 运行 `git diff --check`。
3. 验证通过后检查 diff。
4. 只 stage 本轮相关文件。
5. commit。
6. push。
7. 报告 commit hash 和 push 结果。

每轮回复必须包含：

- 本轮目标
- 本轮完成内容
- Debug 自检
- 架构自检
- 已运行验证命令与结果
- commit hash 与 push 结果
- 下一轮目标
- 是否消耗缓冲轮

推进规则：

- 验证失败：不得提交推送，不得进入下一轮。
- 验证通过但提交失败：不得进入下一轮。
- 提交成功但推送失败：不得进入下一轮。
- 推送成功：记录 commit hash 和远端分支，然后进入下一轮。

---

## 5. 每轮通过后提交推送工作流

优先使用项目 git workflow 包装器：

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Validate.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Commit.cmd -Message "<message>" -Paths <phase-relevant-files>
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Push.cmd
```

如果包装器不适合当前状态，可使用普通 git 命令：

```powershell
git status --short --branch
git diff --stat
git diff --check
git add <phase-relevant files>
git commit -m "<phase>: <round summary>"
git push
git status --short --branch
```

禁止：

- stage 无关 untracked 文件。
- 用 `git reset --hard`、`git checkout --` 或其他破坏性命令清理用户改动。
- 验证未通过时提交。
- push 失败后继续下一轮。

---

## 6. 分轮安排

### Round 1：Phase 0 文档和 ADR 基线

目标：

- 创建 `docs/adr/`。
- 新增 ADR 草案：
  - package manager。
  - host semantics boundary。
  - replay first-class contract。
  - context lease lifecycle。
  - schema hot-path boundary。
- 更新开发计划或架构文档入口，链接本执行指南。

验证：

- `git diff --check`
- Markdown 文件 UTF-8 无 BOM 检查。

PASS：

- ADR 明确 Phase 0-6 期间的核心架构决策。

### Round 2：Phase 0 workspace scaffold

目标：

- 建立 package manager 和 workspace。
- 创建 root `package.json`、`tsconfig.base.json`。
- 创建四个包目录和 `src/index.ts`。
- 选择并记录 pnpm 或 npm。

验证：

- dependency install。
- workspace package discovery。
- `typecheck` 可运行或明确输出当前空包检查。

PASS：

- 四个包被 workspace 识别。

### Round 3：Phase 0 validate 命令和 ops workflow

目标：

- 配置 `build`、`test`、`typecheck`、`lint`、`validate` 最小命令。
- 更新 `.codex/project-ops-workflow.json` 和 `docs/codex-ops-workflow.md`。

验证：

- `npm run validate` 或 `pnpm validate`。
- project ops Validate wrapper。

PASS：

- 后续轮次有统一验证入口。

### Round 4：Phase 1 core ids / control path / raw event queue

目标：

- 实现 `ids.ts`、`control-path.ts`、`raw-event.ts`、`raw-event-queue.ts`。
- 添加单元测试。

验证：

- unit tests。
- typecheck。
- validate。

PASS：

- Raw event ordering 稳定。

### Round 5：Phase 1 DeviceState / Source contract / VirtualInputSource

目标：

- 实现 `source.ts`、`device-state.ts`。
- 在 `testing` 包实现 `VirtualInputSource` 和 fake clock。

验证：

- Virtual source 无 DOM 测试。
- validate。

PASS：

- 可注入 button control value。

### Round 6：Phase 1 BindingGraph / ButtonActionState / press

目标：

- 实现最小 map、binding graph、press interaction、button action state。
- 实现 `createInputFlow` 最小 API。

验证：

- `E` press/release 测试。
- repeated run deterministic 测试。
- validate。

PASS：

- `VirtualInputSource -> ButtonActionState -> Snapshot` 闭环成立。

### Round 7：Phase 2 ContextLease 基础

目标：

- 实现 `ContextLease` 和 context stack。
- `activateContext()` 返回可 dispose lease。
- dispose 幂等。

验证：

- lease lifecycle unit tests。
- validate。

PASS：

- 多 lease lifecycle 可预测。

### Round 8：Phase 2 routing policies

目标：

- 实现 `shared`、`consumeMatched`、`exclusive`。
- 实现 priority routing。

验证：

- modal/gameplay isolation tests。
- shared/exclusive tests。
- validate。

PASS：

- 高优先级 context 可屏蔽 gameplay。

### Round 9：Phase 2 debug snapshot / diagnostics

目标：

- 输出 active context stack。
- 输出 consumed controls。
- 加入 context 相关 diagnostics。

验证：

- debug snapshot tests。
- validate。

PASS：

- context routing 可机器诊断。

### Round 10：Phase 3 replay trace schema

目标：

- 在 schema 包定义 replay trace v0。
- 支持 `control`、`context.activate`、`context.deactivate`、`frame`。

验证：

- valid/invalid trace schema tests。
- validate。

PASS：

- Replay trace 格式固定。

### Round 11：Phase 3 replay runner

目标：

- 在 testing 包实现 replay runner。
- 支持 injected clock。
- 可驱动 context lifecycle。

验证：

- no-DOM replay tests。
- validate。

PASS：

- raw trace 可复现 interact。

### Round 12：Phase 3 action snapshot trace assertion

目标：

- 输出 action snapshot trace。
- 增加 trace assertion helper。

验证：

- same map + same trace exact output tests。
- validate。

PASS：

- Replay deterministic 证据完整。

### Round 13：Phase 4 axis state and composites

目标：

- 实现 `axis1d`、`axis2d` state。
- 实现 `composite1d`、`composite2d`。

验证：

- WASD axis tests。
- validate。

PASS：

- move 类 action 可表达。

### Round 14：Phase 4 processors

目标：

- 实现 `deadzone`、`radialDeadzone`、`normalize2d`、`scale`、`invert`、`clamp`。

验证：

- processor unit tests。
- purity checks where practical。
- validate。

PASS：

- processor 不读取全局状态。

### Round 15：Phase 4 interactions beyond press

目标：

- 实现 `tap`、`hold`、`repeat`。
- repeat 使用 injected frame time。

验证：

- timing boundary tests。
- validate。

PASS：

- interaction 时间语义稳定。

### Round 16：Phase 4/5 InputMap and Override schema

目标：

- 实现 InputMap schema。
- 实现 Override schema。
- 增加 migration hook 形状。

验证：

- schema tests。
- validate。

PASS：

- 配置事实源可校验。

### Round 17：Phase 5 diagnostics and override application

目标：

- 实现 structured diagnostics。
- 实现 override application。
- 覆盖 unresolved action、invalid override、binding conflict。

验证：

- diagnostics tests。
- override tests。
- validate。

PASS：

- 错误可机器读取，invalid override 不静默应用。

### Round 18：Phase 5 browser keyboard and blur reset

目标：

- 实现 browser safe import。
- 实现 Keyboard source。
- 实现 blur / visibility / detach reset。

验证：

- unit tests with DOM-like fixture 或 browser test scaffold。
- validate。

PASS：

- Keyboard E 可触发 action，blur 后无卡键。

### Round 19：Phase 5 pointer / editable filter / wheel

目标：

- 实现 Pointer source。
- 实现 editable target filter。
- 实现 wheel per-frame accumulation。

验证：

- pointer primary tests。
- editable target tests。
- validate。

PASS：

- Pointer Primary 与 Keyboard 可映射同一 action。

### Round 20：Phase 5 basic gamepad and browser package hardening

目标：

- 实现 basic Gamepad South button。
- 实现 basic axes fixture。
- 完成 browser package exports。

验证：

- gamepad fixture tests。
- no DOM import safety check。
- validate。

PASS：

- Browser Source Phase 完成。

### Round 21：缓冲修复 1

目标：

- 修复前 20 轮遗留的测试、类型、架构边界或 package export 问题。

验证：

- validate。
- dependency boundary check。

PASS：

- 无主线阻塞问题。

缓冲轮：

- 本轮计为缓冲轮消耗。

### Round 22：缓冲修复 2 / Sinan contract

目标：

- 新增 `docs/sinan-cooperation/inputflow-sinan-adapter-contract.md`。
- 新增 adapter contract fixtures 或 testing helpers。

验证：

- docs diff check。
- adapter contract tests if implemented。
- validate。

PASS：

- Sinan POC contract 明确，不把 Sinan adapter 放入本仓库 core。

缓冲轮：

- 本轮计为缓冲轮消耗。

### Round 23：缓冲修复 3 / v0.1 hardening

目标：

- 补齐 package exports、declaration output、API examples、release dry-run。
- 修复文档和测试缺口。

验证：

- validate。
- build。
- release dry-run 或 package dry-run。

PASS：

- v0.1 hardening 准备就绪。

缓冲轮：

- 本轮计为缓冲轮消耗。

### Round 24：最终验收

目标：

- 运行完整验证矩阵。
- 检查 Phase 0-6 PASS 标准。
- 更新最终状态文档或报告。
- 提交并推送最终验收结果。

验证：

- `git status --short --branch`
- `git diff --check`
- root `validate`
- typecheck
- test
- build
- lint 或已配置等价命令
- package/release dry-run

PASS：

- Phase 0-6 所有 PASS 标准满足。
- 远端 `main` 包含最终验收提交。
- 最终报告列出 commit hash、验证结果和剩余风险。

---

## 7. PASS 标准

大 Goal PASS 必须全部满足：

- Phase 0：workspace、ADR、四包骨架、validate 命令完成并推送。
- Phase 1：VirtualInputSource 到 ButtonActionState 的 deterministic slice 完成。
- Phase 2：ContextLease routing 完成，modal/gameplay isolation 有测试。
- Phase 3：Replay Contract v0 完成，raw trace 可输出稳定 action snapshot trace。
- Phase 4：axis、composite、processor、interaction、schema 和 override 基线完成。
- Phase 5：Keyboard、Pointer、wheel、editable filter、blur reset、basic Gamepad 完成。
- Phase 6：Sinan adapter contract、v0.1 hardening、exports、docs、release dry-run 完成。
- `@inputflow/core` 无 DOM、React、Three、Sinan 依赖。
- Replay 不依赖真实 DOM event。
- Schema 不进入 frame hot path。
- 每轮都已验证、提交、推送，并记录 commit hash。

---

## 8. 最终报告模板

最终报告必须包含：

```md
## Goal 完成报告

### 范围
- Phase 0:
- Phase 1:
- Phase 2:
- Phase 3:
- Phase 4:
- Phase 5:
- Phase 6:

### PASS 证据
- Workspace / ADR:
- Core deterministic slice:
- ContextLease:
- Replay:
- Axis / schema / diagnostics:
- Browser Source:
- Sinan contract:
- v0.1 hardening:

### 验证结果
- git diff --check:
- validate:
- typecheck:
- test:
- build:
- lint:
- package / release dry-run:

### Git 记录
- 起始 commit:
- 最终 commit:
- 已推送分支:
- 每轮 commit hash:

### 缓冲轮使用
- Round 21:
- Round 22:
- Round 23:

### 剩余风险
-

### 下一步建议
-
```

---

## 9. 每轮 Debug 自检

每轮都必须回答：

- 当前改动能否用最小 fixture 或用户流程解释？
- 如果失败，能否定位到具体层：parser、runtime、schema、source、replay、browser、package、CLI、docs？
- success、failure、empty、stale、incompatible 状态是否覆盖了与本轮相关的部分？
- 如果 UI 或 browser 行为改变，是否增加了可重复 smoke 或 fixture？
- 如果状态或配置改变，export / import / validate / migration 边界是否覆盖？

---

## 10. 每轮架构自检

每轮都必须回答：

- 当前 source-of-truth 是否仍是正确层级？
- `@inputflow/core` 是否仍不依赖 DOM、React、Three、Sinan、Zod hot path？
- 宿主语义是否仍由宿主拥有，ActionId / ContextId 是否仍 opaque？
- capability schema、binding/mapping、usage/audit、runtime state 是否仍分离？
- 是否把 deferred scope 拉进了当前阶段？
- 是否留下无关文件、生成产物或用户改动？

---

## 11. 验证矩阵

| 类型 | 命令或方式 | 必跑轮次 |
|---|---|---|
| Git 状态 | `git status --short --branch` | 每轮开始和结束 |
| Diff 空白检查 | `git diff --check` | 每轮 |
| 文档 BOM 检查 | PowerShell byte check | 文档轮次 |
| Typecheck | root `typecheck` | Round 2 起每轮 |
| Unit test | root `test` | Round 4 起每轮 |
| Build | root `build` | Round 3 起每轮 |
| Validate | root `validate` 或 ops wrapper | Round 3 起每轮 |
| Dependency boundary | static check or tests | Round 3 起每轮 |
| Browser tests | browser package tests | Round 18 起 |
| Replay deterministic | replay trace tests | Round 11 起 |
| Package dry-run | package/release dry-run | Round 23-24 |

---

## 12. 入口同步说明

本仓库当前没有独立 README、TODO、handoff 或 docs index。执行者创建本指南后，应至少在 `docs/InputFlow-Development-Plan-v0.1.md` 中加入本指南链接，作为 Phase 0-6 大 Goal 的执行入口。

如果后续新增 README 或 docs index，必须同步链接：

- 本指南路径：`docs/InputFlow-Phase0-6-Goal-Mode-Execution-Guide.md`
- 轮次预算：24 轮
- 当前 Goal：Phase 0-6 大 Goal
