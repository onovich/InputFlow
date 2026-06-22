# InputFlow Phase 13 Owner Decision Application Goal 模式执行指南

日期：2026-06-22
状态：给执行者使用的 Phase 13 开发指令文档
预计轮数：8 轮
前置验收：Phase 12 已验收为 `AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS`
Owner input：用户已同意架构负责人建议的延期发布倾向

---

## 0. 直接给执行者的 Goal Prompt

你是 InputFlow Phase 13 的执行者。请在 `D:\LabProjects\Engine\InputFlow` 执行 **Owner Decision Application / Release Deferral Record**。

本阶段目标是把 owner 对 Phase 12 决策清单的回复正式落入仓库文档和 guard：当前不执行真实发布，而是记录“延期发布、保留 RC 路线、后续若发布倾向 `0.1.0-rc.0` + public/next、由 owner 签署并由 release executor 执行、Phase 10/11 限制可作为 RC known limits、rollback/deprecate 需要 owner 审批”的决策状态。

重要边界：

- 不执行 `npm publish`。
- 不创建 GitHub Release。
- 不创建 git tag。
- 不读取或写入 secrets/tokens。
- 不修改 package version、license、publishConfig、registry、dist-tag 或 provenance 配置。
- 不在 MIT 与 Apache-2.0 之间替 owner 做精确 license 选择；只记录“公开发布前仍需精确 license 决策”。
- 不创建 `@inputflow/sinan`，不修改 Sinan 或 LudoWeave 仓库。
- 不宣称实体 Gamepad 已验收，不宣称下游 Sinan adapter 已验收。

最终可接受状态：

- `RELEASE_DEFERRED_DECISION_RECORDED`：延期发布和 RC 路线已记录，guard 通过，未执行真实发布。
- `BLOCKED`：无法记录 owner 决策或 guard 无法通过。

---

## 1. 必读上下文

执行前先阅读：

- `AGENTS.md`
- `.codex/Role.md`
- `README.md`
- `CHANGELOG.md`
- `package.json`
- `docs/InputFlow-Development-Plan-v0.1.md`
- `docs/InputFlow-Phase12-Final-Report.md`
- `docs/InputFlow-Phase12-v0.1-Release-Authorization-Goal-Mode-Execution-Guide.md`
- `docs/release/InputFlow-v0.1-Release-Authorization-Packet.md`
- `docs/release/InputFlow-v0.1-Owner-Decision-Matrix.md`
- `docs/release/InputFlow-v0.1-Owner-Sign-Off-Checklist.md`
- `docs/release/InputFlow-v0.1-Publish-Simulation-and-Provenance.md`
- `docs/release/InputFlow-v0.1-Rollback-and-Deprecation-Policy.md`
- `docs/release/InputFlow-v0.1-Final-Release-Candidate-Audit.md`
- `docs/InputFlow-Phase10-Final-Report.md`
- `docs/InputFlow-Phase11-Final-Report.md`
- `scripts/check-release-authorization.mjs`
- `scripts/check-docs.mjs`

---

## 2. 本阶段要完成什么

1. 新增或更新 `docs/release/InputFlow-v0.1-Owner-Decision-Record.md`，记录 owner 当前已确认的方向：
   - 真实发布延期。
   - 后续若进入 RC 发布，倾向 `0.1.0-rc.0`。
   - 后续若进入 npm 发布，倾向 public package + `next` dist-tag。
   - owner 保留签署权，release executor 负责执行。
   - Phase 10 `HARNESS_READY_NO_HARDWARE` 可作为 RC known limit。
   - Phase 11 `HANDOFF_READY_BLOCKED_DOWNSTREAM` 可作为 RC known limit。
   - rollback/deprecate 由 executor 执行但需要 owner 审批。
   - 精确 public license 仍未定，不能发布。
2. 更新 owner decision matrix，把已决定事项从纯 pending 改为 deferred / accepted-for-RC / still-blocked-exact-license 等清晰状态。
3. 更新 owner sign-off checklist，区分“本次已签署的延期方向”和“未来真实发布签署”。
4. 更新 authorization packet、README、CHANGELOG、development plan 和 docs guard。
5. 扩展 `pnpm release:authorization:check`，确保：
   - 决策记录存在。
   - 真实发布仍未发生。
   - package metadata 未被擅自修改。
   - license 精确选择仍被标为 blocking item。
   - Phase 10/11 限制仍被标为 RC known limits，而不是正式 release acceptance。
6. 输出 `docs/InputFlow-Phase13-Final-Report.md`。

---

## 3. 本阶段不做什么

- 不发布。
- 不打 tag。
- 不创建 release。
- 不改 package metadata。
- 不替 owner 选择 MIT 或 Apache-2.0。
- 不把延期方向写成真实发布授权。
- 不修改下游仓库。

---

## 4. 每轮固定工作流

每轮回复必须包含：

- 本轮目标
- 本轮完成内容
- Debug 自检
- 发布治理自检
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

优先使用项目 wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "<message>" -Paths <phase-relevant-paths>
```

验证优先使用：

```powershell
pnpm release:authorization:check
pnpm docs:check
pnpm structure:check
pnpm validate
git diff --check
```

---

## 6. 分轮安排

### Round 1：Owner decision record

创建 owner decision record，记录延期发布与 RC 路线倾向，不修改 package metadata。

验证：`git diff --check`、`pnpm docs:check`。

### Round 2：Decision matrix update

更新 owner decision matrix，把已同意事项标为 deferred / accepted-for-RC，把精确 license 标为 still blocking。

验证：`pnpm release:authorization:check`、`pnpm docs:check`。

### Round 3：Sign-off checklist split

更新 sign-off checklist，区分“已签署延期方向”和“未来真实发布签署”。

验证：docs check、authorization check。

### Round 4：Authorization packet and changelog sync

同步 authorization packet、README、CHANGELOG、development plan。

验证：docs check、`git diff --check`。

### Round 5：Authorization guard hardening

扩展 `scripts/check-release-authorization.mjs`，检查 owner decision record、license 精确选择 blocker、no publish/no tag/no release 边界。

验证：`pnpm release:authorization:check`、`pnpm structure:check`。

### Round 6：Local confidence refresh

运行本地信心矩阵，确认文档/guard 更新没有破坏 RC。

验证：

```powershell
pnpm release:authorization:check
pnpm workflow:check
pnpm sinan:contract:check
pnpm gamepad:harness:check
pnpm validate
```

### Round 7：Final report draft

创建 `docs/InputFlow-Phase13-Final-Report.md`，状态写 `RELEASE_DEFERRED_DECISION_RECORDED` 或 `BLOCKED`。

验证：docs check、authorization check。

### Round 8：Final validation and push

完成最终验证并推送。

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
pnpm release:dry-run
pnpm package:dry-run
```

---

## 7. PASS 标准

Phase 13 PASS 必须同时满足：

- Owner decision record 存在并记录延期发布方向。
- Owner decision matrix 区分已同意方向和仍阻塞事项。
- 精确 public license 仍被标记为未来真实发布 blocker。
- package metadata 未被改变。
- 没有 npm publish、GitHub Release、git tag、secret/token 操作。
- Phase 10/11 限制保留为 RC known limits。
- `pnpm release:authorization:check` 通过。
- 最终报告存在并记录 `RELEASE_DEFERRED_DECISION_RECORDED`。
- 工作树 clean，最终 commit 已推送到 `origin/main`。

---

## 8. 最终报告模板

在 `docs/InputFlow-Phase13-Final-Report.md` 中记录：

```markdown
# InputFlow Phase 13 Final Report

Status: RELEASE_DEFERRED_DECISION_RECORDED | BLOCKED
Final commit:
Pushed branch:

## Summary

## Owner Decision Applied

## Still Blocking Future Real Release

## Validation Evidence

## Non-Scope Preserved

## Recommended Checker Conclusion
```

---

## 9. Debug 自检要求

- 是否把延期方向误写成真实发布授权？
- 是否误改了 package metadata？
- 是否误选了 MIT 或 Apache-2.0？
- 是否误宣称实体 Gamepad 或下游 Sinan adapter 已验收？
- guard 失败时是否能定位到缺失文档或越权发布动作？

---

## 10. 发布治理自检要求

- owner 是否仍保留真实发布最终签署权？
- release executor 是否只在未来授权后执行？
- 当前仓库是否仍只处于 RC review / deferred release 状态？
- package scripts 是否不包含 `npm publish`、`gh release create` 或 `git tag`？
- docs 是否清楚区分 owner decision record 与 actual release record？
