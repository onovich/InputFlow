# InputFlow Phase 11 Sinan Adapter POC Handoff Goal 模式执行指南

日期：2026-06-22
状态：给执行者使用的 Phase 11 开发指令文档
预计轮数：16 轮
前置验收：Phase 10 已验收为 `HARNESS_READY_NO_HARDWARE`

---

## 0. 直接给执行者的 Goal Prompt

你是 InputFlow Phase 11 的执行者。请在 `D:\LabProjects\Engine\InputFlow` 按本指南执行 **Sinan Adapter POC Handoff / Contract Readiness**。

本阶段目标不是在本仓库实现 Sinan adapter，也不是发布 npm 包，而是把 InputFlow 侧已经形成的 Sinan POC 契约整理成可交给 Sinan 仓库落地的稳定交接包。你需要补齐契约 fixture、下游验收清单、诊断/回放证据、guard 命令与最终报告，让 Sinan 侧可以在自己的仓库实现 adapter，并用 InputFlow 提供的契约资产验证行为一致性。

必须遵守：

- 不创建 `@inputflow/sinan` 包。
- 不修改 Sinan 仓库。
- 不定义 Sinan 的最终 action namespace、context priority、EngineMode、World、EventSystem 或 Three 行为。
- 不把 DOM、React、Three、Sinan、Playwright、browser runtime 依赖引入 `packages/core`。
- 不宣称实体 Gamepad 已验收；Phase 10 的状态仍然是 `HARNESS_READY_NO_HARDWARE`。
- 每轮必须先验证，通过后提交并推送；推送失败不得进入下一轮。

最终可接受状态：

- `HANDOFF_READY`：InputFlow 侧 Sinan POC 交接资产完整、验证通过、已推送。
- `HANDOFF_READY_BLOCKED_DOWNSTREAM`：InputFlow 侧资产完整，但真实 Sinan 仓库接入或业务决策仍由对方完成。
- `BLOCKED`：本仓库内必需契约资产或验证无法完成。

---

## 1. 必读上下文

执行前先阅读：

- `AGENTS.md`
- `README.md`
- `CHANGELOG.md`
- `docs/InputFlow-Development-Plan-v0.1.md`
- `docs/InputFlow-Technical-Architecture-v0.1.md`
- `docs/InputFlow-Sinan-Alignment-and-Roadmap-2026-06-20.md`
- `docs/sinan-cooperation/inputflow-sinan-adapter-contract.md`
- `docs/sinan-cooperation/inputflow-sinan-rfc-analysis.md`
- `docs/sinan-cooperation/inputflow-technical-advice-analysis.md`
- `docs/sinan-cooperation/inputflow-business-letter-analysis.md`
- `docs/InputFlow-v0.1-API-Examples.md`
- `docs/InputFlow-Phase9-Final-Report.md`
- `docs/InputFlow-Phase10-Final-Report.md`
- `docs/InputFlow-Phase10-Physical-Gamepad-Evidence.md`
- `packages/testing/src/sinan-adapter-contract.ts`
- `packages/testing/src/sinan-adapter-contract.test.ts`
- `packages/core/src/index.ts`
- `packages/browser/src/index.ts`
- `packages/schema/src/index.ts`
- `package.json`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

如果文件名变化，先用 `rg --files` 查找，不要猜路径。

---

## 2. 本阶段要完成什么

Phase 11 要把 Sinan POC 从“已有契约雏形”推进到“可交接、可验证、可追责”的状态：

1. 梳理并更新 Sinan adapter contract 文档，明确 InputFlow 提供什么、Sinan 侧需要适配什么、双方边界在哪里。
2. 稳定 `packages/testing` 中的 Sinan adapter contract fixture，覆盖：
   - `runtime.gameplay.interact`
   - `editor.viewport.select`
   - modal / pause isolation
   - blur / focus reset
   - replay trace
   - diagnostics handoff
3. 建立一个面向下游的 contract check 命令，例如 `pnpm sinan:contract:check`，该命令只能验证本仓库可验证的契约资产。
4. 补齐下游验收清单，说明 Sinan 仓库接入 adapter 时必须回填哪些证据。
5. 更新 README / API examples / development plan / docs guard，让 Phase 11 资产可被发现。
6. 加强边界 guard，确保 `packages/core` 不受 Sinan、DOM、React、Three、Playwright 等实现依赖污染。
7. 输出 `docs/InputFlow-Phase11-Final-Report.md`，记录完成内容、验证命令、限制、下游剩余工作。

---

## 3. 本阶段不做什么

- 不在本仓库创建或发布 `@inputflow/sinan`。
- 不修改 Sinan 仓库，也不伪造 Sinan 侧接入证据。
- 不做 npm publish、GitHub Release、git tag、license 定稿或版本号最终决策。
- 不实现 EngineLoop、World、EventSystem、Three ray/picking、React diagnostics package、rebind UI、mobile joystick。
- 不要求实体手柄实验室作为本阶段 PASS 条件。
- 不把 Sinan 的业务语义固化到 InputFlow core。

---

## 4. 每轮固定工作流

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

每轮至少运行与本轮变更相关的最小验证。修改共享导出、package scripts、contract fixture、docs guard 或核心边界时，必须扩大验证范围。

---

## 5. 每轮通过后提交推送工作流

优先使用项目已配置 wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "<message>" -Paths <phase-relevant-paths>
```

验证优先使用项目已配置 wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\ReleaseDryRun.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Package.cmd
```

不得 stage unrelated untracked files。提交前必须看 `git status --short --branch` 与 `git diff --stat`。

---

## 6. 分轮安排

### Round 1：Sinan handoff strategy

确认 Phase 11 交接边界，更新或创建 Sinan POC handoff 文档骨架，列出 InputFlow 侧可交付物、Sinan 侧待落地物、不可宣称事项。

验证：`pnpm docs:check`、`git diff --check`。

### Round 2：Contract fixture inventory

盘点现有 `sinan-adapter-contract` fixture 与测试，整理缺口，不改变公共 API 前先写出测试意图。

验证：相关测试、`pnpm validate`。

### Round 3：Editor select fixture

补齐或强化 `editor.viewport.select` 契约 fixture，保证它与 gameplay interact 使用同一 InputFlow 通用机制，但不编码 Sinan editor 业务。

验证：相关测试、core boundary scan。

### Round 4：Modal / pause isolation fixture hardening

强化 modal / pause isolation 契约，证明高优先级 context 可阻断 gameplay，释放后可恢复。

验证：相关测试、`pnpm validate`。

### Round 5：Blur / reset downstream scenario

补齐 blur / focus reset 的下游场景说明和可验证 fixture，保持 browser source 与 core 边界清晰。

验证：相关测试、`pnpm browser:test`。

### Round 6：Diagnostics handoff

整理 diagnostics handoff：哪些诊断来自 InputFlow，Sinan adapter 应该如何记录和上报，但不规定 Sinan UI 表达。

验证：schema/testing 相关测试、docs check。

### Round 7：Downstream acceptance checklist

创建或更新 Sinan 下游验收清单，要求 Sinan 侧回填 adapter commit、测试命令、截图/日志、未覆盖风险。

验证：docs check、结构检查。

### Round 8：Contract check command

增加 `pnpm sinan:contract:check` 或等价命令，只验证本仓库内的 Sinan contract fixture、docs guard 和边界 guard。

验证：新增命令、`pnpm validate`、`pnpm docs:check`。

### Round 9：README / API examples sync

同步 README、API examples、development plan，让外部读者能找到 Sinan POC handoff 入口和状态。

验证：docs check、`git diff --check`。

### Round 10：Package dry-run and export check

确认 package exports、dry-run 包内容不会错误包含 Sinan adapter 包，也不会遗漏 testing contract 所需文件。

验证：`pnpm package:dry-run`、必要的 export checks。

### Round 11：Downstream handoff packet

形成完整 handoff packet：contract docs、fixtures、check command、acceptance checklist、已知限制、使用步骤。

验证：docs check、structure check。

### Round 12：Phase 11 final report draft

起草最终报告，记录当前状态、证据、未完成的下游事项，不提前宣称下游已接入。

验证：docs check、`git diff --check`。

### Round 13：Buffer fix 1

处理前 12 轮遗留问题。若无遗留问题，用于收紧边界扫描和 docs guard。

验证：针对性验证、必要时 `pnpm validate`。

### Round 14：Browser / replay / diagnostics refresh

刷新 browser smoke、replay、diagnostics 相关证据，确保 handoff packet 与真实测试一致。

验证：`pnpm browser:test`、相关 replay/diagnostics tests。

### Round 15：Release confidence refresh

运行 release/package dry-run，确认 Phase 11 不破坏 RC 基线。

验证：`pnpm release:dry-run`、`pnpm package:dry-run`。

### Round 16：Final validation and report

完成最终报告，运行完整本地验证矩阵，提交并推送最终状态。

最低验证矩阵：

```powershell
git diff --check
pnpm sinan:contract:check
pnpm docs:check
pnpm structure:check
pnpm validate
pnpm browser:test
pnpm browser:test:all
pnpm release:dry-run
pnpm package:dry-run
```

如果某个命令不可用，必须说明原因并修复命令或更新指南；不得静默跳过。

---

## 7. PASS 标准

Phase 11 PASS 必须同时满足：

- Sinan handoff 文档存在，且明确 InputFlow / Sinan 双方边界。
- Contract fixture 覆盖 gameplay interact、editor select、modal isolation、blur reset、replay trace、diagnostics handoff。
- `pnpm sinan:contract:check` 可运行并通过。
- README、API examples、development plan、docs guard 均指向 Phase 11 交付物。
- `packages/core` 边界扫描无 DOM、React、Three、Sinan、Playwright、browser runtime 污染。
- release/package dry-run 仍通过。
- 最终报告存在并记录状态为 `HANDOFF_READY`、`HANDOFF_READY_BLOCKED_DOWNSTREAM` 或 `BLOCKED`。
- 工作树 clean，最终 commit 已推送到 `origin/main`。

---

## 8. 最终报告模板

在 `docs/InputFlow-Phase11-Final-Report.md` 中记录：

```markdown
# InputFlow Phase 11 Final Report

Status: HANDOFF_READY | HANDOFF_READY_BLOCKED_DOWNSTREAM | BLOCKED
Final commit:
Pushed branch:

## Summary

## Delivered Artifacts

## Validation Evidence

## Sinan Handoff Packet

## Boundary Evidence

## Downstream Remaining Work

## Non-Scope Confirmed

## Recommended Checker Conclusion
```

---

## 9. Debug 自检要求

每轮至少检查：

- 当前变更是否能用最小 fixture 或最小下游工作流解释？
- 失败是否能定位到 contract、fixture、schema、runtime、browser source、docs guard、package/export 中的具体层？
- success、failure、empty、stale、incompatible 状态是否被覆盖？
- 如果新增命令，错误输出是否足够让下游定位问题？
- 如果修改 docs guard，是否避免把 planned 文件错误当成已完成证据？

---

## 10. 架构自检要求

每轮至少检查：

- InputFlow core 是否仍然只表达通用输入运行时语义？
- Sinan adapter 语义是否保留在 handoff/contract 层，而不是进入 core？
- schema、binding/mapping、diagnostics、runtime state 是否仍然分离？
- 是否避免把 deferred scope 拉进 Phase 11？
- 是否保留 Phase 10 的硬件证据限制，没有宣称实体 Gamepad PASS？

---

## 11. 验证矩阵

基础验证：

```powershell
git diff --check
pnpm docs:check
pnpm structure:check
pnpm validate
```

Phase 11 专项验证：

```powershell
pnpm sinan:contract:check
```

浏览器与发布信心验证：

```powershell
pnpm browser:test
pnpm browser:test:all
pnpm release:dry-run
pnpm package:dry-run
```

边界扫描示例：

```powershell
rg "(@playwright/test|playwright|react|three|@inputflow/browser|@actions|sinan|navigator|document|window)" packages/core/src packages/core/package.json -S
```

该扫描应无输出；若 `rg` 返回 1 且无输出，可视为通过。

---

## 12. 入口同步要求

完成 Phase 11 时至少同步：

- `README.md`
- `CHANGELOG.md`
- `docs/InputFlow-Development-Plan-v0.1.md`
- `docs/InputFlow-v0.1-API-Examples.md`
- `scripts/check-docs.mjs`

不要把 planned 状态写成 complete。只有最终报告和验证完成后，才能把 Phase 11 状态更新为实际完成状态。
