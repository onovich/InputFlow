# InputFlow Phase 10 Physical Gamepad Acceptance Goal 模式执行指南

> 日期：2026-06-22
> 状态：给执行者使用的 Phase 10 开发 / 验收指令文档
> 总轮次预算：16 轮
> 轮次分配：1-12 轮主线实现与验收，13-15 轮缓冲修复，16 轮最终验收
> 目标范围：物理 Gamepad 手工验收、手工测试页、硬件证据记录、release-confidence 结论

---

## 0. 直接给执行者的 Goal Prompt

你正在 InputFlow 仓库中以 Goal 模式执行 Phase 10。请完整阅读本指南和必读上下文，然后按轮次推进，直到 Phase 10 全部完成、硬件验收被明确阻塞，或遇到无法绕开的真实阻塞。

上一阶段 Phase 9 已通过验收，状态为 `RC_READY`。最新可用证据包括：

- Phase 9 最终报告：`docs/InputFlow-Phase9-Final-Report.md`
- Phase 9 最终提交：`c9afc782fa273a26722b573a9f0af08724267d11`
- Required remote validate、required remote browser smoke、remote release dry-run、optional browser matrix 均已有成功 run 证据。
- 本地 `pnpm validate`、`pnpm workflow:check`、`pnpm browser:test`、`pnpm browser:test:all`、`pnpm release:dry-run`、`pnpm package:dry-run` 均已通过。
- v0.1 仍未真实 npm publish、未创建 GitHub Release、未打 git tag。

Phase 10 的目标是处理 Phase 9 仍保留的硬件 release-confidence 风险：自动化 browser fixture 已证明 `navigator.getGamepads()` 集成逻辑，但尚未证明真实物理控制器在目标浏览器中能完成配对、South button、left stick、disconnect / reconnect reset。

```txt
automated gamepad fixture
  -> manual physical controller harness
  -> browser / device evidence table
  -> release-confidence decision
```

执行规则：

- 每一轮都必须有 Debug 自检、架构自检、验证命令与结果。
- 每一轮相关验证通过后，必须提交并推送该轮成果。
- 验证失败不得提交推送，不得进入下一轮。
- 提交失败或推送失败不得进入下一轮。
- 不要 stage 或修改无关用户文件。
- 不要把物理硬件检查伪装成自动 CI gate。
- 不要声称物理 Gamepad PASS，除非真实硬件和浏览器结果已记录。
- 如果当前环境没有物理控制器，最终状态必须是 `HARDWARE_BLOCKED` 或 `HARNESS_READY_NO_HARDWARE`，不能是 `HARDWARE_ACCEPTED`。
- 不要引入真实 npm publish、GitHub Release、git tag、secret 或自动发布流程。
- 不要把 DOM、Playwright、测试页或硬件便利代码引入 `@inputflow/core`。

完成后输出最终报告，说明 Phase 10 的手工硬件证据、commit hash、推送结果、剩余风险和下一阶段建议。

---

## 1. 必读上下文

执行前必须阅读：

- `AGENTS.md`
- `README.md`
- `CHANGELOG.md`
- `docs/InputFlow-Development-Plan-v0.1.md`
- `docs/InputFlow-Technical-Architecture-v0.1.md`
- `docs/InputFlow-Phase9-Final-Report.md`
- `docs/InputFlow-Phase9-v0.1-Release-Candidate-Goal-Mode-Execution-Guide.md`
- `docs/InputFlow-Manual-Gamepad-Release-Checklist.md`
- `docs/InputFlow-Browser-Smoke-Guide.md`
- `docs/InputFlow-CI-Troubleshooting.md`
- `docs/InputFlow-v0.1-API-Examples.md`
- `docs/adr/0006-browser-matrix-strategy.md`
- `docs/adr/0007-ci-release-gates.md`
- `docs/adr/0008-v0.1-release-candidate-policy.md`
- `docs/codex-git-workflow.md`
- `docs/codex-ops-workflow.md`
- `packages/browser/src/gamepad-source.ts`
- `packages/browser/test/gamepad-source.test.ts`
- `tests/browser/gamepad-source.spec.ts`
- `package.json`
- `.codex/project-ops-workflow.json`

上一阶段已接受状态：

- Phase 9 已完成 v0.1 RC review material 和远端 CI 证据。
- README 和 changelog 均明确：自动化 gamepad 覆盖使用 browser-level fixture，physical controller pairing 仍是 manual release-confidence work。
- `docs/InputFlow-Manual-Gamepad-Release-Checklist.md` 已有手工检查口径，但缺少真实执行证据和可复用本地手工测试入口。

Phase 10 选择理由：

- 真实 npm publish / tag / license / release ownership 属于高优先级业务决策，不能由执行者擅自进入。
- Sinan integration POC 会跨入 Sinan 仓库和宿主语义，也应在硬件 release-confidence 风险收口后再作为独立跨仓阶段规划。
- 物理 Gamepad 是 Phase 9 最终报告和 README 共同列出的最窄未收口 release risk。

---

## 2. 本阶段要完成什么

Phase 10 完成后，仓库应具备：

- Phase 10 硬件验收策略 ADR 或 checklist 更新，明确 automated fixture 与 physical controller evidence 的关系。
- 可复用的本地手工 Gamepad harness 页面或等效示例入口，用于真实浏览器读取 physical `navigator.getGamepads()`。
- Harness 文档，说明如何启动、打开、配对、记录 South button、left stick、disconnect / reconnect。
- 手工验收 evidence 文档，记录 tester、OS、browser、controller model、connection type、InputFlow commit、结果和 artifact。
- 如果无物理硬件，明确记录 `HARNESS_READY_NO_HARDWARE` 或 `HARDWARE_BLOCKED`，并说明缺少什么硬件 / 浏览器条件。
- README / changelog / manual checklist 同步 Phase 10 结果口径。
- `docs/InputFlow-Development-Plan-v0.1.md` 和 docs guard 同步 Phase 10 guide / final report。
- Phase 10 final report，状态只能是：
  - `HARDWARE_ACCEPTED`
  - `HARNESS_READY_NO_HARDWARE`
  - `HARDWARE_BLOCKED`

建议技术路线：

- 优先新增一个 repo-local manual harness，放在 `examples/` 或 `docs/manual-harness/` 之类清晰位置。
- Harness 可以是静态 HTML + module script，或通过现有 build output 引入 `@inputflow/browser` 的最小页面；选择最小可维护方案。
- 如果新增 harness 脚本，必须有本地命令或文档说明如何打开。
- 自动化仍只验证 fixture 和 browser source；真实 hardware result 只能手工记录。
- 不升级 Gamepad 为 required CI gate。

---

## 3. 本阶段不做什么

Phase 10 不做：

- 真实 npm publish。
- GitHub Release。
- git tag。
- license / version / release ownership 最终决策。
- physical Gamepad lab automation。
- 多玩家手柄配对系统。
- 长期 gamepad identity / remapping system。
- 完整 rebind UI。
- React diagnostics 正式包。
- mobile virtual joystick。
- pointer picking / world ray / entity hit。
- `@inputflow/sinan` 包。
- Sinan 仓库 adapter 实现。
- 将 physical Gamepad 检查加入 required CI gate。
- 在 `@inputflow/core` 中访问 `window`、`document`、`navigator` 或 DOM 类型。

---

## 4. 每轮固定工作流

每轮开始：

1. 阅读本指南当前轮次目标。
2. 运行或查看 `git status --short --branch`。
3. 确认是否存在无关用户改动。
4. 如有无关改动，不要 stage；必要时在本轮报告中说明。
5. 阅读本轮涉及的最小上下文文件。

每轮实现：

1. 小步提交，保持范围贴合当前轮次。
2. Harness 和文档必须说明 automated fixture 与 physical device 的差异。
3. 手工验收记录必须包含 commit、browser、controller、connection 和结果。
4. 如果没有物理硬件，不要虚构结果；记录 blocker。
5. 文档调整必须保持 UTF-8 无 BOM。
6. 不要让 manual harness 或 DOM convenience code 进入 `@inputflow/core`。

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
- 使用破坏性 git 命令清理用户改动。
- 验证未通过时提交。
- push 失败后继续下一轮。

---

## 6. 分轮安排

### Round 1：Phase 10 硬件验收策略

目标：

- 新增或更新 ADR / checklist strategy，明确 Phase 10 的硬件验收状态值。
- 明确 automated fixture 不等于 physical controller PASS。
- 明确没有硬件时必须报告 `HARNESS_READY_NO_HARDWARE` 或 `HARDWARE_BLOCKED`。

验证：

- `pnpm docs:check`
- `git diff --check`

PASS：

- 后续执行者不会把 fixture PASS 当作 physical PASS。

### Round 2：Manual harness 设计

目标：

- 设计最小本地 Gamepad manual harness。
- 确认 harness 放置路径、启动方式和 dependency boundary。
- 不实现复杂 UI；只显示 South button、left stick、disconnect / reconnect 状态。

验证：

- `pnpm docs:check`
- `git diff --check`

PASS：

- Harness 可以由下一轮实现，且不会污染 core。

### Round 3：Manual harness 实现

目标：

- 新增本地静态 harness 或示例页面。
- 使用 `@inputflow/browser` 的 gamepad source 或等效公开 API。
- 页面能显示 connection、South button、left stick x/y、neutral / missing state。

验证：

- `pnpm validate`
- `pnpm browser:test`
- `git diff --check`

PASS：

- Harness 文件存在并可按文档打开；自动化 baseline 不回退。

### Round 4：Harness smoke / structure guard

目标：

- 为 harness 增加轻量结构检查或 browser smoke，确保入口文件和关键文本 / script 不丢失。
- 不把 physical hardware 纳入 automated required gate。

验证：

- `pnpm structure:check`
- `pnpm browser:test`
- `pnpm validate`
- `git diff --check`

PASS：

- Harness 入口不会悄悄漂移或丢失。

### Round 5：手工验收证据模板

目标：

- 新增 `docs/InputFlow-Phase10-Physical-Gamepad-Evidence.md` 模板。
- 记录 tester、OS、browser、controller、connection、commit、result、artifact。
- 明确 PASS / FAIL / SKIP / BLOCKED 分类。

验证：

- `pnpm docs:check`
- `git diff --check`

PASS：

- 手工硬件测试可被 reviewer 复核。

### Round 6：执行 Chromium / Chrome physical check

目标：

- 如果有物理 controller，在 Chromium / Chrome 上执行 checklist。
- 如果无硬件，记录 blocker，不伪造结果。
- 更新 evidence 文档。

验证：

- `pnpm validate`
- `pnpm browser:test`
- manual evidence review
- `git diff --check`

PASS：

- Chromium / Chrome physical result 被记录，或 blocker 被明确记录。

### Round 7：执行 Firefox physical check

目标：

- 如果环境允许，在 Firefox 上执行 physical check。
- 记录 browser-specific mapping 或 exposure 差异。
- 如果不可用，记录 SKIP / BLOCKED 原因。

验证：

- `pnpm browser:test:all`
- manual evidence review
- `git diff --check`

PASS：

- Firefox physical coverage 或缺口清楚。

### Round 8：执行 WebKit / Safari physical check

目标：

- 如果环境允许，在 WebKit / Safari 上执行 physical check。
- 记录 browser limitation。
- 如果不可用，记录 SKIP / BLOCKED 原因。

验证：

- `pnpm browser:test:all`
- manual evidence review
- `git diff --check`

PASS：

- WebKit / Safari physical coverage 或缺口清楚。

### Round 9：USB / Bluetooth coverage refresh

目标：

- 如果 controller 和 OS 支持，分别记录 USB 与 Bluetooth 连接行为。
- 关注 reconnect、missing state、neutral reset。
- 如果只有一种连接方式，记录 limitation。

验证：

- `pnpm validate`
- manual evidence review
- `git diff --check`

PASS：

- Connection-type 风险被记录。

### Round 10：README / changelog 口径同步

目标：

- 同步 README、CHANGELOG、manual checklist 的 Phase 10 硬件结论。
- 如果未验硬件，明确不提升支持声明。
- 如果已验硬件，列出通过的 browser / controller class。

验证：

- `pnpm docs:check`
- `pnpm validate`
- `git diff --check`

PASS：

- 用户面对的文档不夸大 physical Gamepad 支持。

### Round 11：Phase 10 final report draft

目标：

- 新增 `docs/InputFlow-Phase10-Final-Report.md` 草稿。
- 记录当前证据、缺口、状态草案。
- 将 final report 路径同步到 development plan 和 docs guard。

验证：

- `pnpm docs:check`
- `git diff --check`

PASS：

- 最终验收前证据结构完整。

### Round 12：release-confidence decision

目标：

- 根据 evidence 给出草案状态：`HARDWARE_ACCEPTED`、`HARNESS_READY_NO_HARDWARE` 或 `HARDWARE_BLOCKED`。
- 明确是否影响 v0.1 RC release review。
- 不做真实 release。

验证：

- `pnpm validate`
- `pnpm release:dry-run`
- manual evidence review
- `git diff --check`

PASS：

- 硬件风险对 release review 的影响清楚。

### Round 13：缓冲修复 1

目标：

- 修复前 12 轮遗留的 harness、docs guard、evidence table 或 browser coverage 缺口。

验证：

- `pnpm validate`
- `pnpm browser:test`
- `pnpm docs:check`
- `git diff --check`

PASS：

- 无主线文档或 harness 阻塞。

缓冲轮：

- 本轮认为缓冲轮消耗。

### Round 14：缓冲修复 2

目标：

- 刷新 optional browser matrix 和 manual evidence。
- 修复 cross-browser 文档差异。

验证：

- `pnpm browser:test:all`
- `pnpm docs:check`
- `git diff --check`

PASS：

- Cross-browser physical / automated 差异清楚。

缓冲轮：

- 本轮认为缓冲轮消耗。

### Round 15：release confidence refresh

目标：

- 最终刷新 validate、release dry-run、manual evidence、README / changelog 口径。

验证：

- `pnpm validate`
- `pnpm browser:test`
- `pnpm release:dry-run`
- `pnpm package:dry-run`
- `pnpm docs:check`
- `git diff --check`

PASS：

- Phase 10 最终验收前无已知未分类风险。

缓冲轮：

- 本轮认为缓冲轮消耗。

### Round 16：最终验收

目标：

- 运行完整 Phase 10 验证矩阵。
- 完成 `docs/InputFlow-Phase10-Final-Report.md`。
- 提交并推送最终验收结果。

验证：

- `git status --short --branch`
- `git diff --check`
- `pnpm validate`
- `pnpm browser:test`
- `pnpm browser:test:all`
- `pnpm release:dry-run`
- `pnpm package:dry-run`
- manual evidence review

PASS：

- Phase 10 所有可执行 PASS 标准满足。
- 如果 hardware 可用，最终报告状态为 `HARDWARE_ACCEPTED` 并列出真实 evidence。
- 如果 hardware 不可用，最终报告状态为 `HARNESS_READY_NO_HARDWARE` 或 `HARDWARE_BLOCKED`，并且不夸大支持。
- 远端 `main` 包含最终验收提交。

---

## 7. PASS 标准

Phase 10 full PASS / `HARDWARE_ACCEPTED` 必须全部满足：

- Manual harness 可用并有文档。
- Evidence 文档记录至少一个真实 controller + browser 组合。
- South button press / release 被观察。
- Left stick x/y movement 和 neutral reset 被观察。
- Disconnect reset 被观察。
- Reconnect 行为被记录。
- README / changelog 不夸大未测试 browser 或 controller。
- `pnpm validate` 通过。
- `pnpm browser:test` 通过。
- `pnpm browser:test:all` 通过或有明确环境限制记录。
- `pnpm release:dry-run` 通过。
- `@inputflow/core` 仍无 DOM、React、Three、Sinan、Zod hot-path、Playwright、GitHub Actions、release tooling 或 browser harness 依赖。
- 每轮都已验证、提交、推送，并记录 commit hash。

允许的最终状态：

- `HARDWARE_ACCEPTED`：真实物理 controller evidence 已记录，manual release-confidence 风险可接受。
- `HARNESS_READY_NO_HARDWARE`：harness、docs、automated baseline 均可用，但当前执行环境没有物理硬件；不得声称 physical PASS。
- `HARDWARE_BLOCKED`：harness 或 required manual evidence 被真实问题阻塞，需要用户 / 硬件 / 浏览器环境介入。

---

## 8. 最终报告模板

最终报告必须包含：

```md
## Phase 10 完成报告

### 范围
- Manual harness:
- Evidence template:
- Physical controller checks:
- Browser coverage:
- Connection coverage:
- README / changelog sync:

### 状态
- HARDWARE_ACCEPTED / HARNESS_READY_NO_HARDWARE / HARDWARE_BLOCKED:
- 理由:

### PASS / Blocker 证据
- Harness:
- Automated baseline:
- Physical evidence:
- Browser / controller matrix:
- Dependency boundary:

### 验证结果
- git diff --check:
- pnpm validate:
- pnpm browser:test:
- pnpm browser:test:all:
- pnpm release:dry-run:
- pnpm package:dry-run:
- manual evidence review:

### Git 记录
- 起始 commit:
- 最终 commit:
- 已推送分支:
- 每轮 commit hash:

### 缓冲轮使用
- Round 13:
- Round 14:
- Round 15:

### 剩余风险
-

### 下一阶段建议
-
```

---

## 9. 每轮 Debug 自检

每轮都必须回答：

- 当前改动能否用最小 physical Gamepad 用户流程解释？
- 如果失败，能否定位到具体层：harness load、browser Gamepad API exposure、controller pairing、button mapping、axis mapping、disconnect reset、reconnect behavior、docs guard、package build？
- success、failure、empty、stale、incompatible 状态是否覆盖了与本轮相关的部分？
- 如果没有硬件，是硬件缺失、浏览器不支持、OS 权限、连接方式，还是 harness 问题？
- 如果文档变更，是否能指导下一位 tester 复现？

---

## 10. 每轮架构自检

每轮都必须回答：

- `@inputflow/core` 是否仍不依赖 DOM、React、Three、Sinan、Zod hot path、Playwright、GitHub Actions、release tooling 或 manual harness？
- Manual harness 是否只存在于 examples/docs/test 层，不进入 runtime hot path？
- Browser source 是否仍只把 browser input 标准化为 raw event，不解释宿主 action 语义？
- Physical evidence 是否没有升级为 required CI gate？
- 是否避免了真实发布、secret 依赖、tag、GitHub Release 和 UI scope 膨胀？
- 是否留下无关文件、生成产物或用户改动？

---

## 11. 验证矩阵

| 类型 | 命令或方式 | 必跑轮次 |
|---|---|---|
| Git 状态 | `git status --short --branch` | 每轮开始和结束 |
| Diff 空白检查 | `git diff --check` | 每轮 |
| 文档 BOM 检查 | PowerShell byte check | 文档轮次 |
| Docs check | `pnpm docs:check` | 文档轮次 |
| Structure check | `pnpm structure:check` | harness / guard 轮次 |
| Validate | `pnpm validate` 或 ops wrapper | Round 3 起每轮 |
| Required browser smoke | `pnpm browser:test` | Round 3 起每轮 |
| Optional browser matrix | `pnpm browser:test:all` | Round 7-8、14-16 |
| Release dry-run | `pnpm release:dry-run` | Round 12、15-16 |
| Package dry-run | `pnpm package:dry-run` | Round 15-16 |
| Manual evidence review | checklist / evidence table | Round 6-16 |

---

## 12. 入口同步说明

创建本指南后，至少需要在 `docs/InputFlow-Development-Plan-v0.1.md` 中加入本指南链接，作为 Phase 10 的执行入口。

如果后续新增 README 或 docs index，必须同步链接：

- 本指南路径：`docs/InputFlow-Phase10-Physical-Gamepad-Acceptance-Goal-Mode-Execution-Guide.md`
- 最终报告路径：`docs/InputFlow-Phase10-Final-Report.md`
- 轮次预算：16 轮
- 当前 Goal：Phase 10 Physical Gamepad Acceptance / Manual Hardware Release Confidence
