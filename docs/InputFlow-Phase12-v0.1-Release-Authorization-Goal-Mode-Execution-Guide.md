# InputFlow Phase 12 v0.1 Release Authorization Goal 模式执行指南

日期：2026-06-22
状态：给执行者使用的 Phase 12 开发指令文档
预计轮数：16 轮
前置验收：Phase 11 已验收为 `HANDOFF_READY_BLOCKED_DOWNSTREAM`

---

## 0. 直接给执行者的 Goal Prompt

你是 InputFlow Phase 12 的执行者。请在 `D:\LabProjects\Engine\InputFlow` 执行 **v0.1 Release Authorization / Owner Decision Packet**。

本阶段目标不是发布 npm 包、创建 GitHub Release、创建 git tag 或替负责人决定 license/version。目标是把 InputFlow v0.1 从“release candidate 证据充分”推进到“负责人可以签署发布或明确延期”的状态：整理发布授权包、决策矩阵、远端 CI 证据刷新、package dry-run/provenance 核查、风险与 rollback 说明、签署清单和最终报告。

必须遵守：

- 不执行 `npm publish`。
- 不创建 GitHub Release。
- 不创建 git tag。
- 不写入或读取任何 secret/token。
- 不擅自修改 package license、version、publishConfig、registry、provenance 或 access 策略。
- 不把 `UNLICENSED` 改成公共 license，除非负责人在当前阶段明确授权并给出 license 名称。
- 不创建 `@inputflow/sinan`，不修改 Sinan 或 LudoWeave 仓库。
- 不宣称实体 Gamepad 已验收；Phase 10 仍是 `HARNESS_READY_NO_HARDWARE`。
- 不宣称真实下游 Sinan adapter 已接入；Phase 11 仍是 `HANDOFF_READY_BLOCKED_DOWNSTREAM`。

最终可接受状态：

- `AUTH_PACKET_READY`: 发布授权包完整，所有本仓库验证通过，负责人已给出发布所需决策。
- `AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS`: 发布授权包完整，但 license/version/tag/publish 权限等负责人决策仍未给出。
- `BLOCKED`: 发布授权包、验证、远端证据或本仓库状态无法完成。

---

## 1. 必读上下文

执行前先阅读：

- `AGENTS.md`
- `.codex/Role.md`
- `README.md`
- `CHANGELOG.md`
- `package.json`
- `pnpm-workspace.yaml`
- `.github/workflows/validate.yml`
- `.github/workflows/browser-smoke.yml`
- `.github/workflows/release-dry-run.yml`
- `.github/workflows/optional-browser-matrix.yml`
- `docs/InputFlow-Development-Plan-v0.1.md`
- `docs/InputFlow-Technical-Architecture-v0.1.md`
- `docs/InputFlow-Phase9-Final-Report.md`
- `docs/InputFlow-Phase9-Remote-CI-Evidence.md`
- `docs/InputFlow-Phase9-Package-Dry-Run-Audit.md`
- `docs/InputFlow-Phase10-Final-Report.md`
- `docs/InputFlow-Phase10-Physical-Gamepad-Evidence.md`
- `docs/InputFlow-Manual-Gamepad-Release-Checklist.md`
- `docs/InputFlow-Phase11-Final-Report.md`
- `docs/sinan-cooperation/inputflow-sinan-handoff-packet.md`
- `docs/sinan-cooperation/inputflow-sinan-downstream-acceptance-checklist.md`
- `docs/adr/0008-v0.1-release-candidate-policy.md`
- `docs/adr/0009-physical-gamepad-acceptance-policy.md`
- `scripts/package-dry-run.mjs`
- `scripts/check-package-metadata.mjs`
- `scripts/check-docs.mjs`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

如果路径变化，先用 `rg --files` 查找，不要猜路径。

---

## 2. 本阶段要完成什么

Phase 12 要完成一个可签署的 v0.1 发布授权包：

1. 创建 `docs/release/InputFlow-v0.1-Release-Authorization-Packet.md`，汇总当前 release candidate 的本地验证、远端 CI、package dry-run、手柄限制、Sinan handoff 状态、非目标和负责人待决策项。
2. 创建 license/version/publish 决策矩阵，列出负责人必须决定的事项、推荐选项、风险、默认阻塞状态。
3. 刷新或核查远端 GitHub Actions 证据，记录目标 commit、run id、URL、状态、是否 required gate。
4. 审计 package metadata、package dry-run、exports、tarball 内容、npm publish 前置条件，但不执行 publish。
5. 增加 release authorization guard，例如 `pnpm release:authorization:check`，验证授权包、待决策项、非发布边界和关键 docs 链接。
6. 同步 README、CHANGELOG、development plan 和 docs guard，让 Phase 12 资产可被发现。
7. 输出 `docs/InputFlow-Phase12-Final-Report.md`，记录最终状态、验证证据、是否仍阻塞在负责人决策。

---

## 3. 本阶段不做什么

- 不发布 npm 包。
- 不创建 GitHub Release。
- 不创建 git tag。
- 不配置 secrets、registry token、automation token 或 provenance token。
- 不替负责人选择 license、semver 版本、dist-tag、publish access、release notes 签署人。
- 不把 release dry-run 改成真实发布。
- 不修改 Sinan、LudoWeave 或其他下游仓库。
- 不把 physical Gamepad fixture 证据写成实体硬件验收。
- 不把 Phase 11 的 handoff packet 写成真实下游 adapter acceptance。

---

## 4. 每轮固定工作流

每轮回复必须包含：

- 本轮目标
- 本轮完成内容
- Debug 自检
- 架构/发布治理自检
- 已运行验证命令与结果
- commit hash 与 push 结果
- 下一轮目标
- 是否消耗缓冲轮

推进规则：

- 验证失败：不得提交推送，不得进入下一轮。
- 验证通过但提交失败：不得进入下一轮。
- 提交成功但推送失败：不得进入下一轮。
- 推送成功：记录 commit hash 和远端分支，然后进入下一轮。

每轮都必须检查 `git status --short --branch`，不得 stage unrelated untracked files。

---

## 5. 每轮通过后提交推送工作流

优先使用项目 wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "<message>" -Paths <phase-relevant-paths>
```

验证优先使用项目 wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\ReleaseDryRun.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Package.cmd
```

本阶段可以直接运行专项命令：

```powershell
pnpm workflow:check
pnpm sinan:contract:check
pnpm gamepad:harness:check
pnpm release:authorization:check
```

---

## 6. 分轮安排

### Round 1：Release authorization baseline

确认 Phase 9-11 状态和当前阻塞项，创建发布授权包骨架。明确授权包只支持负责人决策，不执行发布。

验证：`git diff --check`、`pnpm docs:check`。

### Round 2：Owner decision matrix

整理 license、version、tag、npm package access、dist-tag、publish owner、release notes sign-off、rollback owner 等决策矩阵。推荐项可以写，但必须标记为未授权。

验证：`pnpm docs:check`、`git diff --check`。

### Round 3：Package metadata audit

核查四个 workspace package 的 name、version、license、private、exports、files、types、sideEffects、dependencies。不得擅自改 license/version。

验证：`pnpm package:dry-run`、metadata 相关 guard。

### Round 4：Remote CI evidence refresh

刷新或核查 target commit 上的 GitHub Actions 证据：`validate.yml`、`browser-smoke.yml`、`release-dry-run.yml`、`optional-browser-matrix.yml`。如果无法访问远端 run，要记录阻塞原因和最小补救方式。

验证：远端证据文档更新、`pnpm docs:check`。

### Round 5：Local release confidence refresh

重新跑本地 release confidence：validate、workflow、Sinan contract、manual Gamepad harness guard、browser smoke、browser matrix、release/package dry-run。

验证：相关命令全部通过或记录明确不可执行原因。

### Round 6：Publish simulation and provenance notes

整理 publish simulation：npm dry-run 能证明什么、不能证明什么；provenance、registry、access、2FA/OTP、token 权限需要负责人确认什么。

验证：`pnpm package:dry-run`、docs check。

### Round 7：Rollback and deprecate policy

补齐 rollback / deprecate / unpublish 风险说明，明确 npm 真实发布后的撤回限制和谁负责决策。

验证：docs check、`git diff --check`。

### Round 8：Release authorization guard

增加 `pnpm release:authorization:check`，验证授权包、决策矩阵、远端证据入口、非发布边界、Phase 10/11 限制和 docs 链接。

验证：新增命令、`pnpm structure:check`、`pnpm docs:check`。

### Round 9：README / CHANGELOG / development plan sync

同步 README、CHANGELOG、development plan，说明 Phase 12 是授权包阶段，不是发布记录。

验证：`pnpm docs:check`、`pnpm release:authorization:check`。

### Round 10：Final release candidate audit

做一次完整 release candidate audit：core boundary、package tarball、browser matrix、remote evidence、manual limitations、Sinan downstream limitation。

验证：`pnpm validate`、`pnpm browser:test:all`、`pnpm package:dry-run`。

### Round 11：Owner sign-off checklist

创建负责人签署清单，包含可勾选的 release/no-release/延期结论、签署日期、签署人、仍需补充证据。

验证：docs check、authorization check。

### Round 12：Phase 12 final report draft

起草最终报告，状态根据实际情况写 `AUTH_PACKET_READY`、`AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS` 或 `BLOCKED`。

验证：docs check、`git diff --check`。

### Round 13：Buffer fix 1

处理前 12 轮遗留问题。若无遗留问题，用于收紧 authorization guard 和 docs guard。

验证：针对性验证、`pnpm release:authorization:check`。

### Round 14：Buffer fix 2

处理 remote evidence、package audit、workflow guard、CI wording 相关问题。

验证：`pnpm workflow:check`、`pnpm package:dry-run`、docs check。

### Round 15：Release confidence final refresh

运行最终发布信心矩阵，确认授权包没有破坏 RC。

验证：

```powershell
git diff --check
pnpm release:authorization:check
pnpm validate
pnpm browser:test
pnpm browser:test:all
pnpm release:dry-run
pnpm package:dry-run
```

### Round 16：Final validation and push

完成最终报告，提交并推送最终状态。

最低验证矩阵：

```powershell
git diff --check
pnpm release:authorization:check
pnpm workflow:check
pnpm sinan:contract:check
pnpm gamepad:harness:check
pnpm docs:check
pnpm structure:check
pnpm validate
pnpm browser:test
pnpm browser:test:all
pnpm release:dry-run
pnpm package:dry-run
```

如果负责人决策仍未给出，最终状态应为 `AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS`，不得伪造 `AUTH_PACKET_READY`。

---

## 7. PASS 标准

Phase 12 PASS 必须同时满足：

- 发布授权包存在并汇总 Phase 9-11 的真实状态。
- 决策矩阵存在，且没有把未授权事项写成已决定。
- `pnpm release:authorization:check` 存在并通过。
- README、CHANGELOG、development plan、docs guard 均指向 Phase 12 资产。
- package dry-run 通过，且未执行 publish。
- release dry-run 通过，且未创建 tag/release。
- remote CI evidence 被刷新或明确记录无法刷新原因。
- Phase 10 的 physical Gamepad 限制和 Phase 11 的 downstream Sinan 限制被保留。
- 最终报告存在，状态为 `AUTH_PACKET_READY`、`AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS` 或 `BLOCKED`。
- 工作树 clean，最终 commit 已推送到 `origin/main`。

---

## 8. 最终报告模板

在 `docs/InputFlow-Phase12-Final-Report.md` 中记录：

```markdown
# InputFlow Phase 12 Final Report

Status: AUTH_PACKET_READY | AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS | BLOCKED
Final commit:
Pushed branch:

## Summary

## Delivered Artifacts

## Owner Decisions

## Validation Evidence

## Remote CI Evidence

## Package / Publish Audit

## Preserved Non-Scope

## Remaining Blockers

## Recommended Checker Conclusion
```

---

## 9. Debug 自检要求

每轮至少检查：

- 当前变更是否能帮助负责人做发布/延期决定？
- 是否把 dry-run 证据误写成真实发布证据？
- 是否把 remote CI 缺失证据误写成通过？
- 是否把 fixture-level Gamepad 证据误写成实体硬件验收？
- 是否把 Sinan handoff 误写成真实下游 adapter acceptance？
- 新增 guard 的错误信息是否能定位到缺失文档、未决策项或边界污染？

---

## 10. 架构/发布治理自检要求

每轮至少检查：

- `@inputflow/core` 是否仍无 DOM、React、Three、Sinan、Playwright、browser runtime 依赖？
- package metadata 是否没有擅自改变 license/version/publish 策略？
- release dry-run 是否仍不可能执行真实发布？
- docs 是否清楚区分 release candidate、authorization packet、actual published release？
- 是否避免把 Sinan/LudoWeave/下游仓库变成本阶段必改范围？
- 是否保留负责人对 license、version、tag、publish owner、rollback 的最终决策权？

---

## 11. 验证矩阵

基础验证：

```powershell
git diff --check
pnpm docs:check
pnpm structure:check
pnpm validate
```

专项验证：

```powershell
pnpm release:authorization:check
pnpm workflow:check
pnpm sinan:contract:check
pnpm gamepad:harness:check
```

发布信心验证：

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

完成 Phase 12 时至少同步：

- `README.md`
- `CHANGELOG.md`
- `docs/InputFlow-Development-Plan-v0.1.md`
- `docs/release/InputFlow-v0.1-Release-Authorization-Packet.md`
- `scripts/check-docs.mjs`
- release authorization guard 脚本

不要把授权包状态写成真实发布状态。只有 npm publish、GitHub Release、git tag 均真实发生且负责人授权后，才允许把文档写成 published release。
