---
name: swarm-ai-loop
description: DevOps 内循环闭环工作流。自动审查外循环引入的新复杂度，消除存量技术债，保持测试/源码/文档一致性，检测面向用户文档与源码漂移，每轮打 Git Tag 锚点。参考 OpenAI Harness Engineering 理念。
---

# Swarm AI Loop — DevOps 内循环闭环工作流

> **定位**: 研发链路的"内循环守门员"。每当外循环（Feature Branch / PR / Hotfix）引入变更后，本技能自动执行一轮闭环质量巡检，输出可量化的健康报告并打 Git Tag 锚点。
>
> **理念来源**: [OpenAI Harness Engineering](https://openai.com/zh-Hans-CN/index/harness-engineering/) — 约束 + 评测 + 回归闭环，Agent Legibility Architecture，机械化文档/测试强制执行。

---

## 1) 何时触发

当满足以下任一条件时触发本技能：

| 触发场景 | 典型关键词 |
|----------|-----------|
| 外循环合入后质量巡检 | `运行内循环`, `inner loop check`, `swarm check` |
| 消除技术债 | `清理技术债`, `reduce debt`, `eliminate any` |
| 测试/源码/文档一致性检查 | `一致性检查`, `drift check`, `alignment audit` |
| 迭代锚点打标 | `打 tag`, `anchor`, `baseline` |
| CI/CD 质量门禁 | `quality gate`, `pre-merge check` |

---

## 2) 内循环阶段

```
┌──────────────────────────────────────────────────────────────┐
│                    Swarm AI Inner Loop                        │
│                                                              │
│   ① SCAN        ② ASSESS       ③ REPAIR       ④ ANCHOR     │
│  ┌────────┐   ┌────────┐   ┌────────────┐   ┌──────────┐   │
│  │ 变更感知 │──▶│ 质量评估 │──▶│ 自动修复/建议 │──▶│ Git Tag  │   │
│  │ 差异分析 │   │ 回归检测 │   │ 债务消减    │   │ 锚点记录 │   │
│  └────────┘   └────────┘   └────────────┘   └──────────┘   │
│       │                                          │           │
│       └──────────── 漂移检测 (持续) ─────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

### Phase ① SCAN — 变更感知

自动分析自上一个 swarm-loop tag 以来的所有变更。

**执行步骤**:

```bash
# 获取上一个内循环锚点
LAST_TAG=$(git tag --list 'swarm-loop-*' --sort=-creatordate | head -1)
BASE=${LAST_TAG:-HEAD~10}

# 变更文件分类
git diff --name-only $BASE..HEAD
```

**输出**: 按模块分类的变更清单

| 分类 | 匹配规则 | 关注点 |
|------|---------|--------|
| 源码变更 | `src/**/*.{ts,tsx}` (排除 test) | 新增复杂度 |
| 测试变更 | `**/*.test.{ts,tsx}`, `**/__tests__/**` | 覆盖率变化 |
| 文档变更 | `docs/**`, `*.md`, `AGENTS.md` | 文档对齐 |
| 配置变更 | `*.config.*`, `package.json` | 依赖/构建影响 |
| 数据库变更 | `**/setup.sql`, `**/migrations/**` | Schema 迁移 |

**复杂度指标采集**:

```bash
# 新增文件数
git diff --name-only --diff-filter=A $BASE..HEAD | wc -l

# 变更行数（增/删）
git diff --stat $BASE..HEAD | tail -1

# 新增 TODO/FIXME/HACK
git diff $BASE..HEAD | grep -c '^\+.*\b\(TODO\|FIXME\|HACK\|XXX\)\b' || echo 0

# 新增 any/ts-ignore/eslint-disable
git diff $BASE..HEAD | grep -c '^\+.*\bany\b' || echo 0
```

### Phase ② ASSESS — 质量评估

对仓库执行全量质量门禁检查。

**检查矩阵**:

| 检查项 | 命令 | 通过标准 | 权重 |
|--------|------|----------|------|
| TypeScript 类型检查 | `npm run type-check` | exit 0 | 必须通过 |
| ESLint 静态分析 | `npm run lint:check` | 0 error | 必须通过 |
| 单元测试 | `npm run test` | 全部通过 | 必须通过 |
| 覆盖率 | `npm run coverage` | ≥ 当前阈值 | 建议通过 |
| 构建验证 | `npm run build` | exit 0 | 必须通过 |

**回归检测规则**:

```yaml
regression_rules:
  # 新增源码必须有对应测试
  - name: test-coverage-gap
    condition: "新增 .ts/.tsx 源码文件 且 无对应 .test.ts"
    severity: warning
    message: "新增源码 {file} 缺少单元测试"

  # 核心模块变更必须有测试
  - name: core-module-test
    paths:
      - "src/services/**"
      - "src/lib/**"
      - "src/stores/**"
    condition: "变更文件属于核心模块 且 无测试变更"
    severity: error
    message: "核心模块 {file} 变更但未更新测试"

  # 文档漂移检测
  - name: doc-drift
    condition: "源码变更涉及公开 API/类型 且 docs/ 未更新"
    severity: warning
    message: "公开接口变更但文档未同步"
```

### Phase ③ REPAIR — 自动修复与建议

根据评估结果，分两种处理模式。

**自动修复（安全操作）**:

| 操作 | 条件 | 执行方式 |
|------|------|---------|
| Lint 自动修复 | `npm run lint` 有 fixable errors | `npm run lint` (含 --fix) |
| 格式化修复 | 格式不一致 | `npm run format` |
| 导入排序 | 导入顺序不规范 | ESLint auto-fix |

**建议修复（需人工审查）**:

输出结构化修复建议清单：

```markdown
## 🔧 修复建议

### 高优先级
- [ ] `src/stores/useAgentStore.ts` (433行): 拆分为 AgentChatStore + AgentUIStore
- [ ] `src/services/organizationService.ts` (494行): 拆分 CRUD 和 tree 操作

### 中优先级
- [ ] 消减 `any` 使用: 10 处 → 替换为 `unknown` + 类型守卫
- [ ] 消减 `eslint-disable`: 8 处 → 修复根因

### 低优先级
- [ ] 补充 Edge 模块测试: utils/, config/
```

**技术债消减策略**:

```yaml
debt_elimination:
  # 按风险等级排序
  priorities:
    critical:
      - "any 使用在公开 API/类型导出中"
      - "@ts-ignore 隐藏类型错误"
    high:
      - "eslint-disable 覆盖安全规则"
      - "核心模块无测试覆盖"
    medium:
      - "TODO/FIXME 超过 30 天未处理"
      - "超大文件 > 400 行"
    low:
      - "any 使用在内部实现中"
      - "Edge 模块缺少测试"
```

### Phase ④ ANCHOR — Git Tag 锚点

每轮内循环完成后打标，形成可追溯的质量基线。

**打标规则**:

```bash
# Tag 格式: swarm-loop-YYYYMMDD-HHMMSS
TAG_NAME="swarm-loop-$(date -u +%Y%m%d-%H%M%S)"

# 写入 Tag 消息
git tag -a "$TAG_NAME" -m "Swarm AI Inner Loop checkpoint
IHS Score: ${IHS_SCORE}
Tests: ${TEST_COUNT} passed
Coverage: ${COVERAGE_PCT}%
Debt Markers: ${DEBT_COUNT}
Trend: ${TREND}"
```

**Tag 信息结构**:

```yaml
swarm-loop-tag:
  ihs_score: 77.7
  tests_passed: 437
  test_files: 40
  coverage_lines: 28.5%
  debt_markers: 3
  any_count: 10
  eslint_disable: 8
  trend: "变好"
  delta: "+6.3"
```

---

## 3) 漂移检测 — 文档与源码一致性

持续检测面向用户的文档是否与源码同步。

**检测维度**:

| 维度 | 检测方法 | 漂移判定 |
|------|---------|---------|
| API 签名 | 比对 `types/*.ts` 导出与 `docs/Architecture.md` | 类型/函数签名变更但文档未更新 |
| 路由表 | 比对 `config/routes.tsx` 与 `AGENTS.md` 页面列表 | 路由增减但文档未同步 |
| 数据库 Schema | 比对 `setup.sql` 与 `SUPABASE_COOKBOOK.md` | 表/字段变更但操作手册未更新 |
| Agent 工具 | 比对 `lib/agent/tools/` 与 `AGENTS.md` 工具列表 | 新增/移除工具但文档未更新 |
| 依赖版本 | 比对 `package.json` 与 `AGENTS.md` 技术栈表 | 版本升级但文档未同步 |

**检测实现**:

```bash
# 提取 routes.tsx 中定义的路由
grep -oP "path:\s*['\"]([^'\"]+)" src/config/routes.tsx

# 提取 AGENTS.md 中的页面引用
grep -oP "\|\s*\`/[^`]+\`" AGENTS.md

# 提取 tools registry 中的工具名
grep -oP "name:\s*['\"](\w+)" src/lib/agent/tools/*/index.ts

# 提取 AGENTS.md 中的工具列表
grep -oP "^\|\s*\`\w+Tool\`" AGENTS.md
```

**漂移报告模板**:

```markdown
## 📊 漂移检测报告

| 维度 | 状态 | 详情 |
|------|------|------|
| API 签名 | ✅ 对齐 | 无变更 |
| 路由表 | ⚠️ 漂移 | 新增 /analytics 路由未记录到 AGENTS.md |
| 数据库 Schema | ✅ 对齐 | 无变更 |
| Agent 工具 | ✅ 对齐 | 无变更 |
| 依赖版本 | ⚠️ 漂移 | React 19.1 → 19.2，AGENTS.md 未更新 |
```

---

## 4) 完整执行脚本

在仓库根目录执行：

```bash
# 完整内循环（含 IHS 评估 + 漂移检测 + 打标）
# 步骤 1: 质量门禁
npm run ai:check

# 步骤 2: IHS 评估
python3 .claude/skills/ihs-repo-harness/scripts/generate_ihs_report.py --output docs/IHS.md

# 步骤 3: 漂移检测（手动审查输出）

# 步骤 4: 打 Tag 锚点
TAG="swarm-loop-$(date -u +%Y%m%d-%H%M%S)"
git add -A && git commit -m "chore: swarm-loop checkpoint" --allow-empty
git tag -a "$TAG" -m "Swarm AI Inner Loop checkpoint"
```

**快速模式（仅静态分析）**:

```bash
npm run type-check && npm run lint:check && npm run test
python3 .claude/skills/ihs-repo-harness/scripts/generate_ihs_report.py --output docs/IHS.md --skip-runtime-checks
```

---

## 5) 与外循环的协作模式

```
外循环 (Feature/Hotfix)          内循环 (Swarm AI Loop)
───────────────────────          ──────────────────────
需求分析                              │
   ↓                                  │
分支开发                              │
   ↓                                  │
PR/MR 提交 ──────────────────────▶ ① SCAN: 分析变更
                                   ② ASSESS: 质量门禁
                                   ③ REPAIR: 修复/建议
                                   ④ ANCHOR: 打 Tag
                                      │
PR Review ◀──────────────────────── 质量报告
   ↓                                  │
合入主分支                             │
   ↓                                  │
部署上线 ────────────────────────▶ 下一轮 SCAN
```

**CI/CD 集成点**:

| 阶段 | 触发条件 | 内循环动作 |
|------|---------|-----------|
| PR 创建 | `on: pull_request` | SCAN + ASSESS |
| PR 更新 | `on: push (PR branch)` | 增量 SCAN + ASSESS |
| PR 合入 | `on: push (main/develop)` | 全量 SCAN + ASSESS + REPAIR + ANCHOR |
| 定期巡检 | `on: schedule (weekly)` | 全量 + 漂移检测 |

---

## 6) 输出契约

每轮内循环必须产出：

| 产出物 | 路径 | 说明 |
|--------|------|------|
| IHS 报告 | `docs/IHS.md` | 仓库健康度量化评估 |
| 改进计划 | `plan.md` | 可执行的改进路线图 |
| Git Tag | `swarm-loop-*` | 质量基线锚点 |
| 漂移报告 | 终端输出 / PR comment | 文档-源码一致性 |

**质量门禁判定**:

| 条件 | 结果 |
|------|------|
| type-check ✅ + lint ✅ + test ✅ + IHS ≥ 70 | ✅ PASS — 允许合入 |
| 任一必须项失败 | ❌ BLOCK — 阻止合入 |
| IHS < 70 但 trend 变好 | ⚠️ WARN — 允许但标记 |
| IHS 变坏 (Δ < -1) | ❌ BLOCK — 需修复后重新提交 |

---

## 7) 最佳实践

### Harness Engineering 原则应用

| 原则 | 在内循环中的体现 |
|------|----------------|
| **Agent Legibility** | 所有评估结果以结构化 Markdown 输出，便于 AI Agent 理解和引用 |
| **机械化约束** | type-check / lint / test 作为不可绕过的门禁 |
| **可观测性** | IHS 分数 + Git Tag 形成可追溯的质量时间线 |
| **文档即代码** | 漂移检测确保文档与源码的机械化一致性 |
| **渐进式改进** | 覆盖率阈值逐步提升，而非一步到位 |

### 技术债管理策略

```
新增代码 → 零技术债（严格门禁）
存量代码 → 渐进消减（每轮减少 1-3 处）
紧急修复 → 允许临时豁免（下轮必须回收）
```

### 覆盖率渐进目标

| 阶段 | 行覆盖率 | 函数覆盖率 | 分支覆盖率 |
|------|---------|-----------|-----------|
| 当前 | 28% | 28% | 21% |
| Q1 目标 | 40% | 40% | 30% |
| Q2 目标 | 55% | 55% | 45% |
| 长期目标 | 70% | 70% | 60% |
