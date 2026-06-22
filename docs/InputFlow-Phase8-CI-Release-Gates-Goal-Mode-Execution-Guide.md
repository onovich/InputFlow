# InputFlow Phase 8 CI Release Gates Goal 模式执行指南

> 日期：2026-06-22
> 状态：给执行者使用的 Phase 8 开发指令文档
> 总轮次预算：16 轮
> 轮次分配：1-12 轮主实现，13-15 轮缓冲修复，16 轮最终验收
> 目标范围：CI 验证流水线、浏览器 smoke release gate、package dry-run、手动硬件 Gamepad checklist

---

## 0. 直接给执行者的 Goal Prompt

你正在 InputFlow 仓库中以 Goal 模式执行 Phase 8。请完整阅读本指南和必读上下文，然后按轮次推进，直到 Phase 8 全部完成或遇到无法绕开的真实阻塞。

上一阶段 Phase 7 已通过验收。最新 PASS 证据包含：

- Phase 7 最终报告：`docs/InputFlow-Phase7-Final-Report.md`
- 最新验收提交：`38d2aba docs: finalize phase 7 browser report`
- 验证结果：`pnpm validate` 通过，Vitest 27 个测试文件、86 个测试通过
- Required browser smoke：`pnpm browser:test` 通过，Chromium 15 个测试通过
- Optional browser matrix：`pnpm browser:test:all` 通过，Chromium / Firefox / WebKit 共 45 个测试通过
- Release dry-run：`pnpm release:dry-run` 通过

Phase 8 的目标是把 Phase 7 已经在本地验证过的质量门禁落到可复用 CI / release gate 体系中，并补齐物理 Gamepad 的手动发布检查口径：

```txt
local validation
  -> CI validate workflow
  -> CI required Chromium smoke
  -> optional browser matrix workflow
  -> release dry-run workflow
  -> manual Gamepad release checklist
```

执行规则：

- 每一轮都必须有 Debug 自检、架构自检、验证命令与结果。
- 每一轮相关验证通过后，必须提交并推送该轮成果。
- 验证失败不得提交推送，不得进入下一轮。
- 提交失败或推送失败不得进入下一轮。
- 不要 stage 或修改无关用户文件。
- 不要引入真实 npm 发布、GitHub release 发布、secret 依赖或需要外部凭据的流程。
- 不要让 CI 便利代码污染 `@inputflow/core`。
- 默认 CI 要保持稳定、可解释、成本可控；optional matrix 必须和 required gate 分离。

完成后输出最终报告，说明 Phase 8 的 PASS 证据、commit hash、推送结果、剩余风险和下一阶段建议。

---

## 1. 必读上下文

执行前必须阅读：

- `AGENTS.md`
- `docs/InputFlow-Development-Plan-v0.1.md`
- `docs/InputFlow-Technical-Architecture-v0.1.md`
- `docs/InputFlow-Phase0-6-Final-Report.md`
- `docs/InputFlow-Phase7-Final-Report.md`
- `docs/InputFlow-Browser-Smoke-Guide.md`
- `docs/adr/0001-package-manager.md`
- `docs/adr/0006-browser-matrix-strategy.md`
- `docs/codex-git-workflow.md`
- `docs/codex-ops-workflow.md`
- `package.json`
- `playwright.config.ts`
- `.codex/project-ops-workflow.json`

上一阶段已接受状态：

- Phase 7 已完成真实浏览器 smoke 和 Playwright browser matrix。
- `pnpm validate` 保持快速，不包含 Playwright。
- `pnpm release:dry-run` 已显式串起 required Chromium smoke 和 package dry-run。
- `main` 已推送到 `origin/main`。

下一阶段候选说明：

- Phase 7 最终报告明确建议添加 CI jobs，用于 required Chromium smoke 和 optional browser matrix。
- Phase 7 最终报告还建议决定物理 Gamepad pairing 是否需要手动发布 checklist 或后续硬件实验室自动化。
- 因此选择最窄且已被现有文档支持的 Phase 8：CI Release Gates and Manual Hardware Checklist。

---

## 2. 本阶段要完成什么

Phase 8 完成后，仓库应具备：

- `.github/workflows/validate.yml` 或等价 CI workflow，运行 install、lint、typecheck、build、unit tests、structure check、docs check。
- required browser smoke CI workflow 或 job，运行 Chromium smoke。
- release dry-run CI workflow 或 job，运行 `pnpm release:dry-run`。
- optional browser matrix workflow，覆盖 Chromium / Firefox / WebKit，建议使用 manual dispatch 或非阻塞策略，避免不稳定环境阻塞常规开发。
- pnpm store cache 和 Playwright browser cache 策略。
- CI failure troubleshooting 文档。
- 物理 Gamepad 手动发布 checklist，明确设备、浏览器、操作步骤、PASS / FAIL 记录。
- CI / release gate 文档入口同步到开发计划和 ops 文档。
- Phase 8 最终报告记录本地 dry-run、workflow lint / structure validation、以及无法本地触发远端 CI 时的替代验证证据。

建议技术路线：

- 使用 GitHub Actions 作为默认 CI 目标，因为远端已是 GitHub。
- 使用 `actions/setup-node` + `corepack enable` + pnpm cache。
- required workflow 优先跑 `pnpm validate` 和 `pnpm browser:test`。
- release confidence workflow 跑 `pnpm release:dry-run`。
- optional browser matrix 使用 `workflow_dispatch` 或 scheduled job，且文档化它不是 required PR gate。

---

## 3. 本阶段不做什么

Phase 8 不做：

- 真实 npm publish。
- GitHub Release 正式发布。
- changeset version bump。
- 需要私有 token 或 secret 的发布流程。
- 硬件实验室自动化。
- 完整本地多人设备配对。
- 完整重绑定 UI。
- React diagnostics 正式包。
- mobile virtual joystick。
- 复杂多指手势。
- pointer picking、world ray、entity hit。
- 独立发布 `@inputflow/sinan`。
- 将 InputFlow 作为 Sinan hard dependency。

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
2. CI workflow 新增后必须有本地可运行的等价命令。
3. 如果无法本地触发远端 GitHub Actions，必须用 workflow 文件结构检查、本地命令和文档化风险替代。
4. 不要把 CI 或 Playwright convenience code 放入 `@inputflow/core`。
5. 文档调整必须保持 UTF-8 无 BOM。

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

### Round 1：Phase 8 CI 策略 ADR

目标：

- 新增 ADR：CI release gate strategy。
- 明确 required gate、release dry-run gate、optional browser matrix 的关系。
- 明确不做真实发布、不需要 secrets。

验证：

- `git diff --check`
- `pnpm docs:check`

PASS：

- ADR 能解释为什么 `pnpm validate` 仍保持快速，为什么 release gate 显式运行 browser smoke。

### Round 2：Workflow scaffold 和结构检查

目标：

- 创建 `.github/workflows/`。
- 新增最小 workflow 文件骨架。
- 新增脚本或结构检查，确保 workflow 文件存在且关键 job / command 不缺失。

验证：

- `pnpm structure:check`
- `pnpm docs:check`
- `git diff --check`

PASS：

- 仓库能机器检查 CI 入口没有丢失。

### Round 3：Validate CI workflow

目标：

- 实现 required validate workflow。
- 安装 Node / pnpm。
- 运行 `pnpm install --frozen-lockfile`。
- 运行 `pnpm validate`。

验证：

- 本地 `pnpm validate`
- workflow structure check

PASS：

- workflow 与本地 validate 命令一致。

### Round 4：Required Chromium smoke workflow

目标：

- 增加 required browser smoke job 或 workflow。
- 安装 Chromium 浏览器依赖。
- 运行 `pnpm browser:test`。

验证：

- `pnpm browser:test`
- workflow structure check
- `pnpm validate`

PASS：

- required smoke 在本地和 workflow 命令层一致。

### Round 5：Release dry-run workflow

目标：

- 增加 release dry-run workflow 或 job。
- 运行 `pnpm release:dry-run`。
- 明确触发条件：manual dispatch、tag dry-run 或 branch gate，具体策略写入 docs。

验证：

- `pnpm release:dry-run`
- workflow structure check

PASS：

- release confidence path 与 ops `ReleaseDryRun.cmd` 一致。

### Round 6：Optional browser matrix workflow

目标：

- 增加 optional browser matrix workflow。
- 运行 `pnpm browser:test:all`。
- 明确 optional 矩阵触发方式和 failure 处理。

验证：

- `pnpm browser:test:all`
- workflow structure check

PASS：

- Optional matrix 不伪装成 required PR gate。

### Round 7：Cache and artifact policy

目标：

- 配置 pnpm store cache。
- 配置 Playwright browser cache 或明确安装策略。
- 上传 Playwright traces / reports on failure，如适合。

验证：

- workflow structure check。
- `pnpm validate`
- `pnpm browser:test`

PASS：

- CI 性能策略清楚，失败证据可追踪。

### Round 8：CI troubleshooting docs

目标：

- 新增或扩展 CI troubleshooting 文档。
- 覆盖 dependency restore、Playwright install、browser binary missing、NO_COLOR warning、npm dry-run warning。

验证：

- `pnpm docs:check`
- `git diff --check`

PASS：

- 新执行者能按文档定位 CI 失败层级。

### Round 9：Manual physical Gamepad checklist

目标：

- 新增物理 Gamepad 手动发布 checklist。
- 明确设备类型、浏览器、操作步骤、PASS / FAIL 记录格式。
- 明确它不是 automated Phase 8 gate。

验证：

- `pnpm docs:check`
- `git diff --check`

PASS：

- 物理硬件风险有手动发布口径。

### Round 10：Ops docs and development plan sync

目标：

- 更新 `docs/codex-ops-workflow.md`，说明 CI / smoke / release dry-run 的关系。
- 更新 `docs/InputFlow-Development-Plan-v0.1.md`，加入 Phase 8 指南和最终报告路径。

验证：

- `pnpm docs:check`
- `git diff --check`

PASS：

- 项目入口文档能指向 Phase 8。

### Round 11：Local workflow parity audit

目标：

- 审计 CI workflow 中所有命令都有本地等价命令。
- 增加脚本检查 workflow command drift，如适合。
- 确认 `.codex/project-ops-workflow.json` 与 CI gate 不冲突。

验证：

- `pnpm validate`
- `pnpm browser:test`
- `pnpm release:dry-run`
- workflow structure check

PASS：

- 本地 ops 和 CI gates 不分叉。

### Round 12：Phase 8 report draft

目标：

- 新增 `docs/InputFlow-Phase8-Final-Report.md` 草稿。
- 记录前 11 轮 PASS 证据和待最终验收项目。

验证：

- `pnpm docs:check`
- `git diff --check`

PASS：

- 最终验收前证据结构完整。

### Round 13：缓冲修复 1

目标：

- 修复前 12 轮遗留的 workflow、cache、文档或命令漂移问题。

验证：

- `pnpm validate`
- required browser smoke
- workflow structure check

PASS：

- 无主线阻塞问题。

缓冲轮：

- 本轮计为缓冲轮消耗。

### Round 14：缓冲修复 2

目标：

- 补齐 optional matrix、CI troubleshooting、manual Gamepad checklist 的缺口。

验证：

- `pnpm validate`
- `pnpm browser:test:all`
- `pnpm docs:check`

PASS：

- optional matrix 状态和硬件 checklist 均清楚。

缓冲轮：

- 本轮计为缓冲轮消耗。

### Round 15：缓冲修复 3 / release confidence

目标：

- 最终刷新 release dry-run、workflow docs、Phase 8 report draft。

验证：

- `pnpm validate`
- `pnpm release:dry-run`
- `pnpm package:dry-run`

PASS：

- Phase 8 最终验收前无已知阻塞。

缓冲轮：

- 本轮计为缓冲轮消耗。

### Round 16：最终验收

目标：

- 运行完整 Phase 8 验证矩阵。
- 完成 `docs/InputFlow-Phase8-Final-Report.md`。
- 提交并推送最终验收结果。

验证：

- `git status --short --branch`
- `git diff --check`
- `pnpm validate`
- `pnpm browser:test`
- `pnpm browser:test:all`
- `pnpm release:dry-run`
- workflow structure check

PASS：

- Phase 8 所有 PASS 标准满足。
- 远端 `main` 包含最终验收提交。
- 最终报告列出 commit hash、验证结果和剩余风险。

---

## 7. PASS 标准

Phase 8 PASS 必须全部满足：

- CI strategy ADR 已接受。
- Required validate workflow 存在，并运行 `pnpm validate`。
- Required Chromium smoke workflow 或 job 存在，并运行 `pnpm browser:test`。
- Release dry-run workflow 或 job 存在，并运行 `pnpm release:dry-run`。
- Optional browser matrix workflow 存在，并运行 `pnpm browser:test:all` 或明确 manual dispatch / best-effort 策略。
- pnpm / Playwright cache 或 install 策略已文档化。
- CI failure troubleshooting 文档可用。
- Manual physical Gamepad checklist 可用。
- `@inputflow/core` 仍无 DOM、React、Three、Sinan、Zod hot-path、Playwright 依赖。
- `pnpm validate` 通过。
- `pnpm browser:test` 通过。
- `pnpm browser:test:all` 通过或有明确环境限制记录。
- `pnpm release:dry-run` 通过。
- 每轮都已验证、提交、推送，并记录 commit hash。

---

## 8. 最终报告模板

最终报告必须包含：

```md
## Phase 8 完成报告

### 范围
- Validate CI:
- Required browser smoke CI:
- Release dry-run CI:
- Optional browser matrix:
- CI troubleshooting:
- Manual Gamepad checklist:

### PASS 证据
- Validate workflow:
- Browser smoke workflow:
- Release dry-run workflow:
- Optional matrix workflow:
- Cache / artifact policy:
- Gamepad checklist:
- Dependency boundary:

### 验证结果
- git diff --check:
- pnpm validate:
- pnpm browser:test:
- pnpm browser:test:all:
- pnpm release:dry-run:
- workflow structure check:

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

- 当前改动能否用最小 CI job 或本地等价命令解释？
- 如果失败，能否定位到具体层：workflow syntax、dependency restore、pnpm cache、Playwright install、browser smoke、package dry-run、docs check、release gate？
- success、failure、empty、stale、incompatible 状态是否覆盖了与本轮相关的部分？
- 如果 workflow 变更，是否有本地命令或结构检查可重复验证？
- 如果文档或 checklist 变更，是否能指导下一位执行者复现？

---

## 10. 每轮架构自检

每轮都必须回答：

- `@inputflow/core` 是否仍不依赖 DOM、React、Three、Sinan、Zod hot path、Playwright？
- CI / Playwright / release convenience 是否只存在于 workflow、scripts、tests 或 docs 层？
- Required gate 和 optional matrix 是否仍清楚分离？
- 本阶段是否避免真实发布、secret 依赖、硬件自动化、UI scope 膨胀？
- 本地 ops workflow 和 CI gates 是否保持一致？
- 是否留下无关文件、生成产物或用户改动？

---

## 11. 验证矩阵

| 类型 | 命令或方式 | 必跑轮次 |
|---|---|---|
| Git 状态 | `git status --short --branch` | 每轮开始和结束 |
| Diff 空白检查 | `git diff --check` | 每轮 |
| 文档 BOM 检查 | PowerShell byte check | 文档轮次 |
| Docs check | `pnpm docs:check` | 文档轮次 |
| Typecheck | `pnpm typecheck` | Round 3 起每轮 |
| Unit test | `pnpm test` | Round 3 起每轮 |
| Build | `pnpm build` | Round 3 起每轮 |
| Validate | `pnpm validate` 或 ops wrapper | Round 3 起每轮 |
| Required browser smoke | `pnpm browser:test` | Round 4 起每轮 |
| Optional browser matrix | `pnpm browser:test:all` | Round 6 起 best effort，Round 14-16 必跑或记录限制 |
| Release dry-run | `pnpm release:dry-run` | Round 5 起，Round 15-16 必跑 |
| Workflow structure check | script or documented inspection | Round 2 起每轮 |

---

## 12. 入口同步说明

本仓库当前没有独立 README、TODO、handoff 或 docs index。创建本指南后，应至少在 `docs/InputFlow-Development-Plan-v0.1.md` 中加入本指南链接，作为 Phase 8 的执行入口。

如果后续新增 README 或 docs index，必须同步链接：

- 本指南路径：`docs/InputFlow-Phase8-CI-Release-Gates-Goal-Mode-Execution-Guide.md`
- 轮次预算：16 轮
- 当前 Goal：Phase 8 CI Release Gates and Manual Hardware Checklist
