# InputFlow Phase 9 v0.1 Release Candidate Goal 模式执行指南

> 日期：2026-06-22
> 状态：给执行者使用的 Phase 9 开发指令文档
> 总轮次预算：16 轮
> 轮次分配：1-12 轮主实现，13-15 轮缓冲修复，16 轮最终验收
> 目标范围：v0.1 release candidate readiness、远端 GitHub Actions 证据、package metadata、README / changelog / release notes、RC 最终报告

---

## 0. 直接给执行者的 Goal Prompt

你正在 InputFlow 仓库中以 Goal 模式执行 Phase 9。请完整阅读本指南和必读上下文，然后按轮次推进，直到 Phase 9 全部完成或遇到无法绕开的真实阻塞。

上一阶段 Phase 8 已通过验收。最新可用证据包括：

- Phase 8 最终报告：`docs/InputFlow-Phase8-Final-Report.md`
- Phase 8 最终提交：`01b9037 docs: finalize phase 8 report`
- 本地验收结果：`pnpm validate` 通过，27 个测试文件 / 86 个测试通过
- Required browser smoke：`pnpm browser:test` 通过，Chromium 15 个测试通过
- Optional browser matrix：`pnpm browser:test:all` 通过，Chromium / Firefox / WebKit 共 45 个测试通过
- Release dry-run：`pnpm release:dry-run` 通过，包含 Chromium smoke 和四个包的 `npm pack --dry-run`
- `main` 与 `origin/main` 对齐，Phase 8 已推送

Phase 9 的目标是把 InputFlow 从“本地与 CI 配置已闭合”推进到“v0.1 release candidate 可以被审阅”的状态：

```txt
Phase 8 local and CI gate definitions
  -> remote GitHub Actions run evidence
  -> release candidate policy
  -> package metadata and public docs
  -> changelog / release notes
  -> v0.1 RC final report
```

执行规则：

- 每一轮都必须有 Debug 自检、架构自检、验证命令与结果。
- 每一轮相关验证通过后，必须提交并推送该轮成果。
- 验证失败不得提交推送，不得进入下一轮。
- 提交失败或推送失败不得进入下一轮。
- 不要 stage 或修改无关用户文件。
- 不要执行真实 `npm publish`。
- 不要创建 GitHub Release、git tag 或正式版本发布。
- 不要引入需要 private token / secret 的自动发布流程。
- 不要把 CI / release / docs 便利逻辑污染到 `@inputflow/core`。
- 如果无法观察远端 GitHub Actions，需要明确标记 BLOCKED；不要把纯本地验证伪装成远端 CI PASS。

完成后输出最终报告，说明 Phase 9 的 PASS 证据、远端 run id / URL、commit hash、推送结果、剩余风险和下一阶段建议。

---

## 1. 必读上下文

执行前必须阅读：

- `AGENTS.md`
- `docs/InputFlow-Development-Plan-v0.1.md`
- `docs/InputFlow-Technical-Architecture-v0.1.md`
- `docs/InputFlow-Phase8-Final-Report.md`
- `docs/InputFlow-Phase8-CI-Release-Gates-Goal-Mode-Execution-Guide.md`
- `docs/InputFlow-CI-Troubleshooting.md`
- `docs/InputFlow-Manual-Gamepad-Release-Checklist.md`
- `docs/InputFlow-v0.1-API-Examples.md`
- `docs/adr/0001-package-manager.md`
- `docs/adr/0006-browser-matrix-strategy.md`
- `docs/adr/0007-ci-release-gates.md`
- `docs/codex-git-workflow.md`
- `docs/codex-ops-workflow.md`
- `.github/workflows/validate.yml`
- `.github/workflows/browser-smoke.yml`
- `.github/workflows/release-dry-run.yml`
- `.github/workflows/optional-browser-matrix.yml`
- `package.json`
- `packages/core/package.json`
- `packages/schema/package.json`
- `packages/testing/package.json`
- `packages/browser/package.json`
- `.codex/project-ops-workflow.json`

上一阶段已接受状态：

- Phase 8 已完成 GitHub Actions workflow 定义、workflow parity check、CI troubleshooting 和 manual Gamepad checklist。
- 本地 release dry-run 已证明四个包的 tarball dry-run 可以生成。
- GitHub Actions 远端真实运行结果仍是 Phase 8 明确留下的风险。
- optional Firefox / WebKit matrix 仍为 manual best effort，不是 required PR gate。
- physical Gamepad 仍为手动检查，不进入自动 CI。

Phase 9 选择理由：

- Phase 8 最终报告明确建议 review first remote GitHub Actions runs。
- v0.1 研发计划的 M8 hardening 还需要 README、changelog / release notes、package metadata 和 release candidate 口径。
- 这是从工程完成走向可审阅 RC 的最窄下一阶段；不应直接跳到 Sinan 集成或真实发布。

---

## 2. 本阶段要完成什么

Phase 9 完成后，仓库应具备：

- v0.1 RC 策略 ADR，明确 RC 与真实发布的边界。
- 远端 GitHub Actions 观察记录，至少覆盖 latest `validate.yml` 和 `browser-smoke.yml` run。
- 如果权限允许，记录 `release-dry-run.yml` 和 `optional-browser-matrix.yml` 手动触发 run 的结果。
- 如果远端 run 无法观察或触发，最终报告必须明确 BLOCKED 原因，不得声称 full PASS。
- 根级 README 或 docs index，面向外部读者说明 InputFlow 的定位、包结构、安装方式、最小用法和当前限制。
- CHANGELOG / release notes 草案，记录 v0.1 RC 的主要能力、验证矩阵、已知限制和非目标。
- package metadata 审计与补齐，包括 description、license、repository、keywords、exports、files、sideEffects、types/main 等公开发布相关字段。
- package dry-run 结果审计，确认四个包的 tarball 只包含预期文件。
- release readiness 文档或最终报告，明确 v0.1 RC 是否可进入人工 release review。
- `docs/InputFlow-Development-Plan-v0.1.md` 和 docs guard 同步 Phase 9 guide / final report。

建议技术路线：

- 使用 GitHub CLI (`gh`) 优先读取远端 Actions run；如果不可用，记录具体缺口。
- 只观察或手动触发 dry-run workflow，不做真实 release。
- README 面向 library 用户，不写营销页。
- package metadata 只补公共 npm 元数据，不引入真实 publish 凭证。
- package dry-run 继续通过 `pnpm package:dry-run` 和 `pnpm release:dry-run` 验证。
- RC 最终报告用 `RC_READY`、`RC_READY_LOCAL_ONLY`、`BLOCKED` 三种状态之一表达结果。

---

## 3. 本阶段不做什么

Phase 9 不做：

- 真实 npm publish。
- GitHub Release 正式发布。
- 创建 git tag。
- changeset 真实 version bump。
- 私有 token / secret 接入。
- 自动发布 pipeline。
- 将 optional Firefox / WebKit matrix 升级为 required gate，除非先写 ADR 并且稳定验证通过。
- physical Gamepad 实验室自动化。
- React diagnostics 正式包。
- 重绑定 UI。
- mobile virtual joystick。
- pointer picking / world ray / entity hit。
- `@inputflow/sinan` 独立包。
- 把 InputFlow 作为 Sinan hard dependency。
- 把 DOM、Playwright、GitHub Actions、release tooling 引入 `@inputflow/core`。

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
2. 远端 CI 观察必须记录 run id、workflow、branch、commit、结论和链接。
3. 如果远端命令不可用，必须记录不可用原因和下一步所需用户动作。
4. 文档调整必须保持 UTF-8 无 BOM。
5. 不要让 release/CI 便利代码进入 core。

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

### Round 1：Phase 9 RC 策略 ADR

目标：

- 新增 ADR：v0.1 release candidate policy。
- 明确 RC_READY、RC_READY_LOCAL_ONLY、BLOCKED 三种结论。
- 明确真实发布、tag、npm publish、GitHub Release 都不属于 Phase 9。

验证：

- `git diff --check`
- `pnpm docs:check`

PASS：

- ADR 能解释为什么 Phase 9 先做 RC review，而不是直接 release 或 Sinan 集成。

### Round 2：远端 CI 观察手册

目标：

- 新增远端 GitHub Actions 观察文档或扩展 CI troubleshooting。
- 写清 `gh run list`、`gh run view`、manual dispatch、run URL 记录方式。
- 明确无 gh / 无权限 / workflow 未触发时的 BLOCKED 口径。

验证：

- `pnpm docs:check`
- `git diff --check`

PASS：

- 新执行者能按文档复现远端 CI 观察流程。

### Round 3：README / docs index

目标：

- 新增根级 `README.md` 或仓库 docs index。
- 面向外部 library 用户说明定位、包结构、安装、最小用法、验证命令和限制。
- 链接 API examples、architecture、CI troubleshooting、manual Gamepad checklist。

验证：

- `pnpm docs:check`
- `git diff --check`

PASS：

- 仓库入口不再只依赖内部开发计划。

### Round 4：package metadata audit

目标：

- 审计四个包的 `package.json`。
- 补齐适合 RC 的 description、license、repository、keywords、homepage 或 bugs 字段。
- 保持 root package private，不做真实发布。

验证：

- `pnpm package:dry-run`
- `pnpm validate`
- `git diff --check`

PASS：

- 四个包的公开元数据足够进入 release review。

### Round 5：package metadata guard

目标：

- 新增或扩展脚本，机器检查 package metadata 和 export/files 口径。
- 让 structure 或 docs guard 能发现 metadata 漂移。

验证：

- `pnpm structure:check`
- `pnpm package:dry-run`
- `pnpm validate`
- `git diff --check`

PASS：

- metadata 不是只靠人工记忆维护。

### Round 6：CHANGELOG / release notes 草案

目标：

- 新增 `CHANGELOG.md` 或 `docs/InputFlow-v0.1-RC-Release-Notes.md`。
- 记录 v0.1 RC 能力、验证矩阵、已知限制、非目标和升级风险。
- 明确这是 RC 草案，不是正式发布公告。

验证：

- `pnpm docs:check`
- `git diff --check`

PASS：

- 外部 reviewer 能快速看到 v0.1 RC 包含什么、不包含什么。

### Round 7：API examples and README parity

目标：

- 审计 `docs/InputFlow-v0.1-API-Examples.md` 与 README 的一致性。
- 如有缺口，补齐 core、browser、schema、testing、Sinan fixture 的最小片段。
- 不引入示例 app 或 UI。

验证：

- `pnpm docs:check`
- `pnpm validate`
- `git diff --check`

PASS：

- public docs 与实际导出 API 不冲突。

### Round 8：观察 required remote validate / browser smoke

目标：

- 使用 `gh` 或等效 GitHub Actions 页面观察 latest `validate.yml` 和 `browser-smoke.yml`。
- 记录 workflow、run id、commit、branch、status、URL。
- 如果无法观察，停止并按 BLOCKED 报告所需权限或用户动作。

验证：

- `gh run list --workflow validate.yml --limit 5` 或等效证据
- `gh run list --workflow browser-smoke.yml --limit 5` 或等效证据
- `pnpm workflow:check`
- `git diff --check`

PASS：

- latest required remote gates 对当前 `main` 或明确记录的 commit 通过。

### Round 9：触发或观察 remote release dry-run

目标：

- 如果权限允许，触发 `release-dry-run.yml` manual workflow。
- 记录 run id / URL / commit / 结果。
- 如果不能触发，停止并报告 BLOCKED；不要伪造 PASS。

验证：

- `gh workflow run release-dry-run.yml --ref main` 或等效 GitHub UI 操作记录
- `gh run view <run-id>` 或等效结果
- 本地 `pnpm release:dry-run`
- `git diff --check`

PASS：

- remote release dry-run 成功，或本阶段明确 BLOCKED。

### Round 10：触发或观察 optional browser matrix

目标：

- 如果权限允许，触发或观察 `optional-browser-matrix.yml`。
- 记录 Chromium / Firefox / WebKit 结果。
- 决定它保持 manual best effort，还是提出未来 scheduled job 建议。

验证：

- `gh workflow run optional-browser-matrix.yml --ref main` 或等效 GitHub UI 操作记录
- `gh run view <run-id>` 或等效结果
- 本地 `pnpm browser:test:all`
- `pnpm workflow:check`
- `git diff --check`

PASS：

- optional matrix 结果被记录，且没有被误升级为 required gate。

### Round 11：package dry-run artifact audit

目标：

- 记录 `pnpm package:dry-run` 的四个包 tarball 内容摘要。
- 确认 `dist`、`package.json`、`.d.ts`、`.js`、source maps / declaration maps 口径符合 RC。
- 记录 npm env warning 是否仍为非阻塞。

验证：

- `pnpm package:dry-run`
- `pnpm release:dry-run`
- `git diff --check`

PASS：

- tarball 内容风险可被 reviewer 直接审阅。

### Round 12：Phase 9 final report draft

目标：

- 新增 `docs/InputFlow-Phase9-Final-Report.md` 草稿。
- 记录前 11 轮证据、远端 run 待补项、RC readiness 草案。
- 将报告路径同步到开发计划和 docs guard。

验证：

- `pnpm docs:check`
- `git diff --check`

PASS：

- 最终验收前证据结构完整。

### Round 13：缓冲修复 1

目标：

- 修复前 12 轮遗留的 README、metadata、docs guard 或 release note 漂移。

验证：

- `pnpm validate`
- `pnpm docs:check`
- `pnpm package:dry-run`
- `git diff --check`

PASS：

- 无主线文档或 metadata 阻塞。

缓冲轮：

- 本轮认为缓冲轮消耗。

### Round 14：缓冲修复 2

目标：

- 刷新远端 CI 证据和 optional matrix 证据。
- 修复远端 run 暴露的 workflow 或 documentation gap。

验证：

- `pnpm workflow:check`
- `pnpm browser:test:all`
- 远端 CI run 证据刷新
- `git diff --check`

PASS：

- 远端 required gates 和 optional matrix 状态清楚。

缓冲轮：

- 本轮认为缓冲轮消耗。

### Round 15：release confidence refresh

目标：

- 最终刷新 release dry-run、本地 validate、package dry-run、README / changelog 口径。
- 确认 RC final report 草稿无过时结论。

验证：

- `pnpm validate`
- `pnpm browser:test`
- `pnpm release:dry-run`
- `pnpm package:dry-run`
- `pnpm docs:check`
- `git diff --check`

PASS：

- Phase 9 最终验收前无已知阻塞。

缓冲轮：

- 本轮认为缓冲轮消耗。

### Round 16：最终验收

目标：

- 运行完整 Phase 9 验证矩阵。
- 完成 `docs/InputFlow-Phase9-Final-Report.md`。
- 提交并推送最终验收结果。

验证：

- `git status --short --branch`
- `git diff --check`
- `pnpm validate`
- `pnpm workflow:check`
- `pnpm browser:test`
- `pnpm browser:test:all`
- `pnpm release:dry-run`
- `pnpm package:dry-run`
- 远端 GitHub Actions run 证据

PASS：

- Phase 9 所有 PASS 标准满足。
- 远端 `main` 包含最终验收提交。
- 最终报告列出 commit hash、验证结果、远端 run id / URL、RC status 和剩余风险。

---

## 7. PASS 标准

Phase 9 PASS 必须全部满足：

- RC strategy ADR 已接受。
- README 或 docs index 可作为外部入口。
- CHANGELOG / release notes 草案可用。
- package metadata 审计完成并有机器守卫。
- `pnpm validate` 通过。
- `pnpm workflow:check` 通过。
- `pnpm browser:test` 通过。
- `pnpm browser:test:all` 通过，或有明确环境限制记录。
- `pnpm release:dry-run` 通过。
- `pnpm package:dry-run` 通过。
- GitHub Actions required validate remote run 已观察并通过。
- GitHub Actions required browser smoke remote run 已观察并通过。
- Remote release dry-run workflow 已触发并通过；如果无法触发，本阶段不得标为 full PASS。
- Optional browser matrix remote result 已记录，且仍保持 optional / manual best effort。
- `@inputflow/core` 仍无 DOM、React、Three、Sinan、Zod hot-path、Playwright、GitHub Actions 或 release tooling 依赖。
- 每轮都已验证、提交、推送，并记录 commit hash。

允许的最终状态：

- `RC_READY`：本地与远端 required/release gates 均通过，RC 可进入人工 release review。
- `RC_READY_LOCAL_ONLY`：本地全部通过，但远端手动 release / optional matrix 有明确非阻塞限制；不得声称远端 release 已通过。
- `BLOCKED`：远端 required gate 或 release dry-run 无法观察/触发，或真实失败未修复。

---

## 8. 最终报告模板

最终报告必须包含：

```md
## Phase 9 完成报告

### 范围
- RC strategy:
- Remote validate:
- Remote browser smoke:
- Remote release dry-run:
- Optional browser matrix:
- README / docs index:
- CHANGELOG / release notes:
- Package metadata:
- Package dry-run audit:

### PASS 证据
- RC ADR:
- README:
- Release notes:
- Package metadata guard:
- Remote run evidence:
- Local validation:
- Dependency boundary:

### 验证结果
- git diff --check:
- pnpm validate:
- pnpm workflow:check:
- pnpm browser:test:
- pnpm browser:test:all:
- pnpm release:dry-run:
- pnpm package:dry-run:
- remote validate run:
- remote browser smoke run:
- remote release dry-run:
- optional browser matrix:

### Git 记录
- 起始 commit:
- 最终 commit:
- 已推送分支:
- 每轮 commit hash:

### RC 状态
- RC_READY / RC_READY_LOCAL_ONLY / BLOCKED:
- 理由:

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

- 当前改动能否用最小 release candidate 用户流程解释？
- 如果失败，能否定位到具体层：docs、package metadata、exports、tarball、workflow syntax、dependency restore、Playwright install、browser smoke、GitHub Actions permission、manual dispatch、npm dry-run？
- success、failure、empty、stale、incompatible 状态是否覆盖了与本轮相关的部分？
- 如果远端 CI 观察失败，是权限问题、workflow 不存在、run 未触发、run 失败，还是结果不属于最新 commit？
- 如果 package metadata 变更，是否通过 package dry-run 和机器 guard 验证？
- 如果文档变更，是否能指导下一位 reviewer 复现？

---

## 10. 每轮架构自检

每轮都必须回答：

- `@inputflow/core` 是否仍不依赖 DOM、React、Three、Sinan、Zod hot path、Playwright、GitHub Actions 或 release tooling？
- Release candidate 逻辑是否只存在于 docs、workflow、scripts、package metadata 或 release notes 层？
- README / changelog 是否没有重新定义宿主语义或 Sinan namespace？
- Required gate、release gate、optional matrix 是否仍清楚分离？
- 是否避免了真实发布、secret 依赖、tag、GitHub Release 和 UI scope 膨胀？
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
| Structure check | `pnpm structure:check` | package / workflow 轮次 |
| Workflow check | `pnpm workflow:check` | CI / remote 轮次 |
| Validate | `pnpm validate` 或 ops wrapper | Round 4 起每轮 |
| Required browser smoke | `pnpm browser:test` | Round 8 起每轮，Round 15-16 必跑 |
| Optional browser matrix | `pnpm browser:test:all` | Round 10 起 best effort，Round 14-16 必跑 |
| Release dry-run | `pnpm release:dry-run` | Round 9 起，Round 15-16 必跑 |
| Package dry-run | `pnpm package:dry-run` | Round 4 起 package 轮次，Round 15-16 必跑 |
| Remote validate | `gh run list --workflow validate.yml --limit 5` / `gh run view` | Round 8 起 |
| Remote browser smoke | `gh run list --workflow browser-smoke.yml --limit 5` / `gh run view` | Round 8 起 |
| Remote release dry-run | `gh workflow run release-dry-run.yml --ref main` / `gh run view` | Round 9 起 |
| Remote optional matrix | `gh workflow run optional-browser-matrix.yml --ref main` / `gh run view` | Round 10 起 |

---

## 12. 入口同步说明

本仓库当前没有独立 docs index。创建本指南后，至少需要在 `docs/InputFlow-Development-Plan-v0.1.md` 中加入本指南链接，作为 Phase 9 的执行入口。

如果后续新增 README 或 docs index，必须同步链接：

- 本指南路径：`docs/InputFlow-Phase9-v0.1-Release-Candidate-Goal-Mode-Execution-Guide.md`
- 最终报告路径：`docs/InputFlow-Phase9-Final-Report.md`
- 轮次预算：16 轮
- 当前 Goal：Phase 9 v0.1 Release Candidate / Remote CI Verification
