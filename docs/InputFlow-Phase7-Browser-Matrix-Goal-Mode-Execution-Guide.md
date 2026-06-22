# InputFlow Phase 7 Browser Matrix Goal 模式执行指南

> 日期：2026-06-22
> 状态：给执行者使用的 Phase 7 开发指令文档
> 总轮次预算：16 轮
> 轮次分配：1-12 轮主实现，13-15 轮缓冲修复，16 轮最终验收
> 目标范围：真实浏览器矩阵、Browser Source 集成硬化、浏览器 smoke 文档与发布信心补强

---

## 0. 直接给执行者的 Goal Prompt

你正在 InputFlow 仓库中以 Goal 模式执行 Phase 7。请完整阅读本指南和必读上下文，然后按轮次推进，直到 Phase 7 全部完成或遇到无法绕开的真实阻塞。

上一阶段 Phase 0-6 已通过验收。最新 PASS 证据包含：

- Phase 0-6 最终报告：`docs/InputFlow-Phase0-6-Final-Report.md`
- 验收修复提交：`a8fae4a fix(core): wire timed interactions`
- 验证结果：`pnpm validate` 通过，27 个测试文件、86 个测试通过，`pnpm package:dry-run` 通过

Phase 7 的目标是消化 Phase 0-6 最终报告里的首要剩余风险：

```txt
Browser source tests use DOM-like fixtures, not a real Chromium/Firefox/WebKit matrix.
```

本阶段要把 `@inputflow/browser` 从 DOM-like fixture 验证推进到真实浏览器 smoke / integration 验证，并保持 InputFlow 的核心架构边界：

- `@inputflow/core` 仍无 DOM、React、Three、Sinan、Zod hot-path 依赖。
- Browser-specific globals 仍只存在于 `@inputflow/browser`。
- Replay 和 schema hot-path 边界不倒退。
- 不做重绑定 UI、React diagnostics UI、touch 完整手势或 `@inputflow/sinan` 独立包。

执行规则：

- 每一轮都必须有 Debug 自检、架构自检、验证命令与结果。
- 每一轮相关验证通过后，必须提交并推送该轮成果。
- 验证失败不得提交推送，不得进入下一轮。
- 提交失败或推送失败不得进入下一轮。
- 不要 stage 或修改无关用户文件。
- 不要把真实浏览器测试便利代码引入 `@inputflow/core`。
- 优先建立可重复、可机器运行的 smoke，而不是人工 demo。

完成后输出最终报告，说明 Phase 7 的 PASS 证据、commit hash、推送结果、剩余风险和下一阶段建议。

---

## 1. 必读上下文

执行前必须阅读：

- `AGENTS.md`
- `docs/InputFlow-Design-Document-v0.1.md`
- `docs/InputFlow-Sinan-Alignment-and-Roadmap-2026-06-20.md`
- `docs/InputFlow-Technical-Architecture-v0.1.md`
- `docs/InputFlow-Development-Plan-v0.1.md`
- `docs/InputFlow-Phase0-6-Goal-Mode-Execution-Guide.md`
- `docs/InputFlow-Phase0-6-Final-Report.md`
- `docs/sinan-cooperation/inputflow-sinan-adapter-contract.md`
- `docs/codex-git-workflow.md`
- `docs/codex-ops-workflow.md`
- `package.json`
- `packages/browser/src/*`
- `packages/browser/test/*`
- `packages/testing/src/*`

上一阶段已接受状态：

- Phase 0-6 已完成并验收通过。
- `main` 已推送到 `origin/main`。
- `@inputflow/browser` 已有 Keyboard、Pointer、wheel、editable filter、blur reset、basic Gamepad 源。
- 当前浏览器包测试主要使用 DOM-like fixture，而不是真实 Chromium / Firefox / WebKit。

下一阶段候选说明：

- 文档没有显式定义 Phase 7。
- 最终报告列出的第一项剩余风险是浏览器真实矩阵缺口。
- 因此选择最窄且已被现有文档支持的 Phase 7：Browser Matrix and Integration Hardening。

---

## 2. 本阶段要完成什么

Phase 7 完成后，仓库应具备：

- 真实浏览器 smoke / integration 测试入口。
- 至少 Chromium 可自动运行。
- Firefox 和 WebKit 有可运行策略：能自动运行则纳入默认矩阵；若本地环境限制导致不稳定，则纳入显式可选矩阵和文档化命令。
- Browser Source 的真实浏览器验证覆盖：
  - Keyboard `code` path。
  - Pointer primary button。
  - wheel per-frame accumulation。
  - editable target filter。
  - blur / visibility reset。
  - attach / detach listener cleanup。
- Browser package 的 safe import 仍在无 DOM 环境通过。
- CI / local validate 的默认成本可控。
- 文档说明如何运行 browser matrix、如何解读失败、哪些浏览器是 required / optional。
- Phase 7 最终报告记录 browser matrix 验证结果。

建议技术路线：

- 优先评估 Vitest Browser Mode + Playwright provider，符合原始设计文档技术栈。
- 如果 Vitest Browser Mode 在当前环境代价过高，允许使用 Playwright test runner 作为 browser smoke harness，但必须在 ADR 或 Phase 7 文档中说明选择理由。
- 默认 `pnpm validate` 不应变成慢速或脆弱流程；可以新增 `pnpm browser:test`、`pnpm smoke:browser`、`pnpm browser:test:all` 等分层命令。

---

## 3. 本阶段不做什么

Phase 7 不做：

- 完整重绑定 UI。
- React diagnostics 正式包。
- mobile virtual joystick。
- 复杂多指手势。
- 完整本地多人设备配对。
- pointer picking、world ray、entity hit。
- Sinan editor command 全量迁移。
- 独立发布 `@inputflow/sinan`。
- 将 InputFlow 作为 Sinan hard dependency。
- 将 Playwright/Vitest Browser 便利逻辑塞进 `@inputflow/core`。
- 强行让所有浏览器都成为默认 required matrix，如果本地环境或依赖下载不稳定。

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
2. 新增浏览器验证时，先写最小 fixture，再扩大矩阵。
3. 若真实浏览器依赖下载或环境不可用，先记录失败层级，不要改 core 边界绕过问题。
4. 新增命令必须写入 `package.json`、ops workflow 或文档中的合适位置。
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

### Round 1：Phase 7 调研和测试策略 ADR

目标：

- 调研现有 Vitest / TypeScript / pnpm 配置。
- 选择 browser smoke 技术路线。
- 新增 ADR：browser matrix strategy。
- 明确 required vs optional browser matrix。

验证：

- `git diff --check`
- `pnpm docs:check`

PASS：

- ADR 明确为什么选择 Vitest Browser Mode 或 Playwright smoke harness。
- 默认 validate 和 browser matrix 的关系清楚。

### Round 2：Browser smoke harness scaffold

目标：

- 增加 browser smoke 依赖和配置。
- 新增最小 browser smoke 入口。
- 增加 package scripts，例如 `browser:test` 或 `smoke:browser`。

验证：

- dependency install。
- `pnpm typecheck`
- smoke harness help/list 或最小空测试。

PASS：

- 能启动 browser smoke runner，不需要业务测试先完整覆盖。

### Round 3：真实浏览器 Keyboard smoke

目标：

- 在真实浏览器页面中 attach `createKeyboardSource()`。
- 验证 `KeyboardEvent.code` 映射到 `<Keyboard>/code/KeyE`。
- 验证 key repeat 不重复产生 press edge。

验证：

- browser smoke required matrix。
- `pnpm validate`

PASS：

- Chromium 至少自动通过 Keyboard smoke。

### Round 4：真实浏览器 Pointer smoke

目标：

- 验证 pointer primary button。
- 验证 pointer cancel / detach cleanup。
- 保持 pointer source 不输出 world ray / entity hit。

验证：

- browser smoke required matrix。
- `pnpm validate`

PASS：

- Pointer Primary 可触发同一 action。

### Round 5：真实浏览器 wheel smoke

目标：

- 验证 wheel per-frame accumulation。
- 验证下一帧 wheel reset 为 zero。
- 覆盖空 wheel 状态。

验证：

- browser smoke required matrix。
- `pnpm validate`

PASS：

- wheel 行为在真实浏览器中稳定。

### Round 6：Editable target 和 focus policy smoke

目标：

- 在真实浏览器中验证 input / textarea / select / contenteditable 默认过滤。
- 验证非 editable target 仍可触发 gameplay action。

验证：

- browser smoke required matrix。
- `pnpm validate`

PASS：

- 文本编辑场景不会误触 gameplay shortcut。

### Round 7：Blur / visibility reset smoke

目标：

- 验证 blur 后 held key/button 合成 release。
- 如果 visibilitychange 可稳定模拟，加入 visibility reset；否则文档化限制并保留 fixture test。

验证：

- browser smoke required matrix。
- `pnpm validate`

PASS：

- blur reset 无卡键。

### Round 8：Attach / detach lifecycle smoke

目标：

- 验证 repeated attach / detach 不重复 listener。
- 验证 detach 后不再推送事件。
- 验证 disconnect releaseAll 不破坏 sink 生命周期。

验证：

- browser smoke required matrix。
- `pnpm validate`

PASS：

- Browser Source 生命周期可重复。

### Round 9：Browser Gamepad fixture strategy

目标：

- 明确真实浏览器中 gamepad 自动化限制。
- 增加 browser-level gamepad fixture 或 documented mock strategy。
- 保持 basic South / left stick 范围，不扩大玩家配对。

验证：

- gamepad fixture tests。
- `pnpm validate`

PASS：

- Gamepad 限制清楚，basic source 行为仍被覆盖。

### Round 10：Firefox / WebKit optional matrix

目标：

- 尝试启用 Firefox / WebKit smoke。
- 能稳定运行则加入 matrix；不能稳定运行则加入可选命令和故障说明。
- 记录浏览器兼容状态。

验证：

- required browser matrix。
- optional matrix best effort。
- `pnpm validate`

PASS：

- 矩阵策略真实可执行，不伪装覆盖。

### Round 11：Docs and troubleshooting

目标：

- 新增 browser matrix 文档。
- 说明如何安装浏览器依赖、运行 required/optional smoke、排查常见失败。
- 更新开发计划或技术架构中 Phase 7 链接。

验证：

- `git diff --check`
- `pnpm docs:check`
- required browser smoke

PASS：

- 新执行者能按文档复现 browser smoke。

### Round 12：Ops workflow integration

目标：

- 将 required browser smoke 接入 ops workflow 合适位置，或明确作为 release gate。
- 不让默认 validate 变得不稳定；若不接入 validate，必须有独立 release validation 命令。
- 更新 `.codex/project-ops-workflow.json` 和 `docs/codex-ops-workflow.md`。

验证：

- ops wrapper relevant command。
- `pnpm validate`
- required browser smoke。

PASS：

- Codex 后续知道如何运行 browser validation。

### Round 13：缓冲修复 1

目标：

- 修复前 12 轮遗留的 browser smoke 稳定性、依赖、类型或文档问题。

验证：

- `pnpm validate`
- required browser smoke

PASS：

- 无主线阻塞问题。

缓冲轮：

- 本轮计为缓冲轮消耗。

### Round 14：缓冲修复 2

目标：

- 补齐缺失断言或矩阵文档。
- 修复 optional browser matrix 发现的兼容问题，前提是不扩大 Phase 7 范围。

验证：

- `pnpm validate`
- required browser smoke
- optional browser smoke best effort

PASS：

- required matrix 稳定，optional matrix 状态明确。

缓冲轮：

- 本轮计为缓冲轮消耗。

### Round 15：缓冲修复 3 / release confidence

目标：

- 补 package dry-run、exports 或 docs 中与 browser matrix 相关的缺口。
- 更新 Phase 7 final report 草稿。

验证：

- `pnpm validate`
- required browser smoke
- `pnpm package:dry-run`

PASS：

- Phase 7 最终验收前无已知阻塞。

缓冲轮：

- 本轮计为缓冲轮消耗。

### Round 16：最终验收

目标：

- 运行完整 Phase 7 验证矩阵。
- 写入 `docs/InputFlow-Phase7-Final-Report.md`。
- 提交并推送最终验收结果。

验证：

- `git status --short --branch`
- `git diff --check`
- `pnpm validate`
- required browser smoke command
- optional browser smoke best effort, with result recorded
- `pnpm package:dry-run`

PASS：

- Phase 7 所有 PASS 标准满足。
- 远端 `main` 包含最终验收提交。
- 最终报告列出 commit hash、验证结果和剩余风险。

---

## 7. PASS 标准

Phase 7 PASS 必须全部满足：

- Browser smoke harness 可运行。
- Required browser matrix 至少覆盖 Chromium。
- Firefox / WebKit 要么自动通过，要么作为 optional matrix 有明确命令和限制说明。
- Keyboard `code` path 在真实浏览器中通过。
- Pointer primary button 在真实浏览器中通过。
- wheel accumulation / reset 在真实浏览器中通过。
- editable target filter 在真实浏览器中通过。
- blur reset 在真实浏览器中通过。
- attach / detach lifecycle 在真实浏览器中通过。
- Gamepad 自动化限制被文档化，basic behavior 仍有 fixture 或 browser-level 覆盖。
- `@inputflow/core` 仍无 DOM、React、Three、Sinan、Zod hot-path 依赖。
- `pnpm validate` 通过。
- `pnpm package:dry-run` 通过。
- 每轮都已验证、提交、推送，并记录 commit hash。

---

## 8. 最终报告模板

最终报告必须包含：

```md
## Phase 7 完成报告

### 范围
- Browser smoke harness:
- Required browser matrix:
- Optional browser matrix:
- Browser Source coverage:
- Ops workflow integration:

### PASS 证据
- Keyboard smoke:
- Pointer smoke:
- Wheel smoke:
- Editable target smoke:
- Blur / visibility reset:
- Attach / detach lifecycle:
- Gamepad fixture / limitation:
- Dependency boundary:

### 验证结果
- git diff --check:
- pnpm validate:
- required browser smoke:
- optional browser smoke:
- pnpm package:dry-run:

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

- 当前改动能否用最小 browser fixture 或用户流程解释？
- 如果失败，能否定位到具体层：test runner、browser install、page harness、source attach、DOM event payload、raw event queue、device state、binding runtime？
- success、failure、empty、stale、incompatible 状态是否覆盖了与本轮相关的部分？
- 如果 browser smoke 改变，是否能在本地重复运行？
- 如果命令或依赖改变，install / validate / package dry-run 边界是否覆盖？

---

## 10. 每轮架构自检

每轮都必须回答：

- `@inputflow/core` 是否仍不依赖 DOM、React、Three、Sinan、Zod hot path？
- Browser-specific helpers 是否只存在于 `@inputflow/browser`、测试或脚本层？
- ActionId / ContextId 是否仍为 opaque host-owned semantics？
- Replay、schema、binding/runtime state 是否仍分离？
- 是否把 deferred scope 拉进了当前阶段，例如重绑定 UI、React UI、touch 手势或 Sinan adapter？
- 是否留下无关文件、生成产物或用户改动？

---

## 11. 验证矩阵

| 类型 | 命令或方式 | 必跑轮次 |
|---|---|---|
| Git 状态 | `git status --short --branch` | 每轮开始和结束 |
| Diff 空白检查 | `git diff --check` | 每轮 |
| 文档 BOM 检查 | PowerShell byte check | 文档轮次 |
| Typecheck | `pnpm typecheck` | Round 2 起每轮 |
| Unit test | `pnpm test` | Round 2 起每轮 |
| Build | `pnpm build` | Round 2 起每轮 |
| Validate | `pnpm validate` 或 ops wrapper | Round 2 起每轮 |
| Browser required smoke | Phase 7 required browser command | Round 3 起每轮 |
| Browser optional smoke | Phase 7 optional browser command | Round 10 起 |
| Package dry-run | `pnpm package:dry-run` | Round 15-16 |
| Docs check | `pnpm docs:check` | 文档轮次 |

---

## 12. 入口同步说明

本仓库当前没有独立 README、TODO、handoff 或 docs index。创建本指南后，应至少在 `docs/InputFlow-Development-Plan-v0.1.md` 中加入本指南链接，作为 Phase 7 的执行入口。

如果后续新增 README 或 docs index，必须同步链接：

- 本指南路径：`docs/InputFlow-Phase7-Browser-Matrix-Goal-Mode-Execution-Guide.md`
- 轮次预算：16 轮
- 当前 Goal：Phase 7 Browser Matrix and Integration Hardening
