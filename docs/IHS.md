# IHS 仓库驾驭评测报告

- 生成时间: 2026-03-07 02:57:24 UTC
- 分析分支: `cursor/harness-c9c6`
- 当前提交: `18d3518`
- 评测框架: IHS (IDE Harness Score)，参考 OpenAI Harness Engineering 的“约束 + 评测 + 回归”闭环。
- 评测输出: `docs/IHS.md`

## 1) 总览结论

- **IHS 总分**: **77.7/100**
- **仓库状态**: **可控（好）**
- **趋势判断（对比 HEAD~1）**: **变好**
- 静态趋势分: 当前 `83.3` vs 上一提交 `77.0` (Δ `6.3`)

| 维度 | 分数 | 权重 |
| --- | ---: | ---: |
| 代码腐化度 | 93.5 | 40% |
| 测试信号 | 49.2 | 35% |
| 文档对齐 | 92.5 | 25% |

## 2) 代码腐化度（Code Entropy）

- 源码文件数: `177`
- 源码有效行: `21025`
- 债务标记（TODO/FIXME/HACK/XXX）: `3`
- `any` 使用计数: `10`
- `@ts-ignore/@ts-nocheck` 计数: `0`
- `eslint-disable` 计数: `8`
- 超大文件（>400 行）: `5`

## 3) 测试信号（Harness Checks）

- 测试文件数: `40`
- 测试/源码比: `0.226`
- 覆盖率摘要: lines=28.54%, statements=28.07%, branches=21.03%, functions=28.12%

| 检查项 | 命令 | 结果 | 耗时(s) |
| --- | --- | --- | ---: |
| Type Check | `npm run type-check` | `pass` | 0.16 |
| Unit Test | `npm run test` | `pass` | 8.51 |
| Coverage | `npm run coverage -- --coverage.reporter=json-summary` | `fail` | 10.32 |

## 4) 文档对齐（Docs Alignment）

- 文档存在率: `5/6`
- 近历史窗口文档对齐率: `5/1` = `5.0`
- 文档新鲜度（<=120 天）: `5/5`

## 5) 技术债结论（变好/变坏）

- 最终判断: **好**
- 趋势判断: **变好**
- 判定规则: 若总体分 >= 70 则状态为“好”，否则为“坏”；趋势按静态趋势分对比 HEAD~1。

## 6) 改进优先级（Next Actions）

1. 降低 `any` 与 `eslint-disable`：把高风险类型豁免收敛到网关层。
2. 提升测试/源码比到 >= 0.35，新增测试优先覆盖核心服务与 Agent Tool。
3. 每次核心代码变更同步更新 `docs/` 与 `AGENTS.md`，把文档对齐率拉高到 >= 0.8。
4. 维持 type-check + unit-test + coverage 的持续门禁，避免“先上车后补票”。

## 7) 原始数据快照

```json
{
  "scores": {
    "overall": 77.7,
    "corrosion": 93.5,
    "testing": 49.2,
    "docs": 92.5,
    "static_current": 83.3,
    "static_previous": 77.0,
    "trend_delta": 6.3,
    "trend": "变好"
  },
  "metrics": {
    "source_files": 177,
    "test_files": 40,
    "source_loc": 21025,
    "debt_markers": 3,
    "any_usage": 10,
    "ts_ignore": 0,
    "eslint_disable": 8,
    "large_files": 5,
    "doc_files_present": 5
  },
  "doc_alignment": {
    "code_commits": 1,
    "docs_commits": 5,
    "ratio": 5.0
  },
  "doc_freshness": {
    "present_docs": 5,
    "fresh_docs": 5,
    "fresh_ratio": 1.0,
    "days_old": {
      "AGENTS.md": 0.7,
      "README.md": 0.7,
      "docs/Architecture.md": 32.0,
      "docs/Epics.yaml": 32.0,
      "app/README.md": 0.7
    }
  },
  "runtime": {
    "commands": [
      {
        "status": "pass",
        "returncode": 0,
        "duration_seconds": 0.16,
        "command": "npm run type-check",
        "cwd": "/workspace/app",
        "stdout_tail": "> opc-starter@1.0.0 type-check\n> tsc --noEmit",
        "stderr_tail": ""
      },
      {
        "status": "pass",
        "returncode": 0,
        "duration_seconds": 8.51,
        "command": "npm run test",
        "cwd": "/workspace/app",
        "stdout_tail": "[DataService] 📴 网络已断开，后续操作将保存到本地\n\n ✓ src/services/data/network/__tests__/networkManager.test.ts (8 tests) 6ms\n ✓ src/types/__tests__/validation.test.ts (16 tests) 6ms\n ✓ src/types/__tests__/error.test.ts (19 tests) 5ms\n ✓ src/components/agent/a2ui/__tests__/utils.test.ts (12 tests) 6ms\n ✓ src/lib/agent/tools/navigation/index.test.ts (8 tests) 6ms\n ✓ src/utils/__tests__/dateFormatter.test.ts (15 tests) 8ms\n ✓ src/stores/__tests__/useAuthStore.test.ts (11 tests) 5ms\n ✓ src/lib/__tests__/permissions.test.ts (19 tests) 5ms\n ✓ src/config/__tests__/agentSuggestions.test.ts (11 tests) 4ms\n ✓ src/utils/imageCompressor.test.ts (5 tests) 5ms\n ✓ src/stores/__tests__/useUIStore.test.ts (9 tests) 6ms\n ✓ src/lib/agent/tools/__tests__/helpers.test.ts (5 tests) 3ms\n ↓ src/utils/fileHash.test.ts (5 tests | 5 skipped)\n\n Test Files  34 passed | 1 skipped (35)\n      Tests  437 passed | 5 skipped (442)\n   Start at  02:57:05\n   Duration  8.16s (transform 1.20s, setup 1.32s, import 4.11s, tests 2.29s, environment 12.67s)",
        "stderr_tail": "    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:37\n    at Traces.$ (file:///workspace/app/node_modules/vitest/dist/chunks/traces.CCmnQaNT.js:142:27)\n    at trace (file:///workspace/app/node_modules/vitest/dist/chunks/test.B8ej_ZHS.js:239:21)\n    at runTest (file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:12)\n\nstderr | src/stores/__tests__/useProfileStore.test.ts > useProfileStore > updateProfile > rolls back on failure\nFailed to update profile: Error: Update failed\n    at /workspace/app/src/stores/__tests__/useProfileStore.test.ts:79:58\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:145:11\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:915:26\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1243:20\n    at new Promise (<anonymous>)\n    at runWithTimeout (file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1209:10)\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:37\n    at Traces.$ (file:///workspace/app/node_modules/vitest/dist/chunks/traces.CCmnQaNT.js:142:27)\n    at trace (file:///workspace/app/node_modules/vitest/dist/chunks/test.B8ej_ZHS.js:239:21)\n    at runTest (file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:12)\n\nstderr | src/lib/agent/__tests__/a2uiActionHandler.test.ts > A2UIActionHandler > unknown actions > returns error for unknown action\n[A2UI ActionHandler] 未知 action: unknown.action"
      },
      {
        "status": "fail",
        "returncode": 1,
        "duration_seconds": 10.32,
        "command": "npm run coverage -- --coverage.reporter=json-summary",
        "cwd": "/workspace/app",
        "stdout_tail": "stdout | src/services/data/network/__tests__/networkManager.test.ts > NetworkManager > setup > dispatches custom network event on online\n[DataService] 🌐 网络已连接\n\nstdout | src/services/data/network/__tests__/networkManager.test.ts > NetworkManager > setup > dispatches custom network event on offline\n[DataService] 📴 网络已断开，后续操作将保存到本地\n\n ✓ src/services/data/network/__tests__/networkManager.test.ts (8 tests) 12ms\n ✓ src/utils/__tests__/dateFormatter.test.ts (15 tests) 8ms\n ✓ src/types/__tests__/error.test.ts (19 tests) 6ms\n ✓ src/stores/__tests__/useAuthStore.test.ts (11 tests) 5ms\n ✓ src/lib/__tests__/permissions.test.ts (19 tests) 5ms\n ✓ src/utils/imageCompressor.test.ts (5 tests) 5ms\n ✓ src/config/__tests__/agentSuggestions.test.ts (11 tests) 6ms\n ✓ src/lib/agent/tools/__tests__/helpers.test.ts (5 tests) 3ms\n ↓ src/utils/fileHash.test.ts (5 tests | 5 skipped)\n\n Test Files  34 passed | 1 skipped (35)\n      Tests  437 passed | 5 skipped (442)\n   Start at  02:57:14\n   Duration  9.87s (transform 1.12s, setup 2.02s, import 4.41s, tests 2.40s, environment 13.04s)",
        "stderr_tail": "    at trace (file:///workspace/app/node_modules/vitest/dist/chunks/test.B8ej_ZHS.js:239:21)\n    at runTest (file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:12)\n\nstderr | src/stores/__tests__/useProfileStore.test.ts > useProfileStore > updateProfile > rolls back on failure\nFailed to update profile: Error: Update failed\n    at /workspace/app/src/stores/__tests__/useProfileStore.test.ts:79:58\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:145:11\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:915:26\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1243:20\n    at new Promise (<anonymous>)\n    at runWithTimeout (file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1209:10)\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:37\n    at Traces.$ (file:///workspace/app/node_modules/vitest/dist/chunks/traces.CCmnQaNT.js:142:27)\n    at trace (file:///workspace/app/node_modules/vitest/dist/chunks/test.B8ej_ZHS.js:239:21)\n    at runTest (file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:12)\n\nERROR: Coverage for lines (28.54%) does not meet global threshold (80%)\nERROR: Coverage for functions (28.12%) does not meet global threshold (80%)\nERROR: Coverage for statements (28.07%) does not meet global threshold (80%)\nERROR: Coverage for branches (21.03%) does not meet global threshold (80%)"
      }
    ],
    "type_check": {
      "status": "pass",
      "returncode": 0,
      "duration_seconds": 0.16,
      "command": "npm run type-check",
      "cwd": "/workspace/app",
      "stdout_tail": "> opc-starter@1.0.0 type-check\n> tsc --noEmit",
      "stderr_tail": ""
    },
    "unit_test": {
      "status": "pass",
      "returncode": 0,
      "duration_seconds": 8.51,
      "command": "npm run test",
      "cwd": "/workspace/app",
      "stdout_tail": "[DataService] 📴 网络已断开，后续操作将保存到本地\n\n ✓ src/services/data/network/__tests__/networkManager.test.ts (8 tests) 6ms\n ✓ src/types/__tests__/validation.test.ts (16 tests) 6ms\n ✓ src/types/__tests__/error.test.ts (19 tests) 5ms\n ✓ src/components/agent/a2ui/__tests__/utils.test.ts (12 tests) 6ms\n ✓ src/lib/agent/tools/navigation/index.test.ts (8 tests) 6ms\n ✓ src/utils/__tests__/dateFormatter.test.ts (15 tests) 8ms\n ✓ src/stores/__tests__/useAuthStore.test.ts (11 tests) 5ms\n ✓ src/lib/__tests__/permissions.test.ts (19 tests) 5ms\n ✓ src/config/__tests__/agentSuggestions.test.ts (11 tests) 4ms\n ✓ src/utils/imageCompressor.test.ts (5 tests) 5ms\n ✓ src/stores/__tests__/useUIStore.test.ts (9 tests) 6ms\n ✓ src/lib/agent/tools/__tests__/helpers.test.ts (5 tests) 3ms\n ↓ src/utils/fileHash.test.ts (5 tests | 5 skipped)\n\n Test Files  34 passed | 1 skipped (35)\n      Tests  437 passed | 5 skipped (442)\n   Start at  02:57:05\n   Duration  8.16s (transform 1.20s, setup 1.32s, import 4.11s, tests 2.29s, environment 12.67s)",
      "stderr_tail": "    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:37\n    at Traces.$ (file:///workspace/app/node_modules/vitest/dist/chunks/traces.CCmnQaNT.js:142:27)\n    at trace (file:///workspace/app/node_modules/vitest/dist/chunks/test.B8ej_ZHS.js:239:21)\n    at runTest (file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:12)\n\nstderr | src/stores/__tests__/useProfileStore.test.ts > useProfileStore > updateProfile > rolls back on failure\nFailed to update profile: Error: Update failed\n    at /workspace/app/src/stores/__tests__/useProfileStore.test.ts:79:58\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:145:11\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:915:26\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1243:20\n    at new Promise (<anonymous>)\n    at runWithTimeout (file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1209:10)\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:37\n    at Traces.$ (file:///workspace/app/node_modules/vitest/dist/chunks/traces.CCmnQaNT.js:142:27)\n    at trace (file:///workspace/app/node_modules/vitest/dist/chunks/test.B8ej_ZHS.js:239:21)\n    at runTest (file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:12)\n\nstderr | src/lib/agent/__tests__/a2uiActionHandler.test.ts > A2UIActionHandler > unknown actions > returns error for unknown action\n[A2UI ActionHandler] 未知 action: unknown.action"
    },
    "coverage": {
      "status": "fail",
      "returncode": 1,
      "duration_seconds": 10.32,
      "command": "npm run coverage -- --coverage.reporter=json-summary",
      "cwd": "/workspace/app",
      "stdout_tail": "stdout | src/services/data/network/__tests__/networkManager.test.ts > NetworkManager > setup > dispatches custom network event on online\n[DataService] 🌐 网络已连接\n\nstdout | src/services/data/network/__tests__/networkManager.test.ts > NetworkManager > setup > dispatches custom network event on offline\n[DataService] 📴 网络已断开，后续操作将保存到本地\n\n ✓ src/services/data/network/__tests__/networkManager.test.ts (8 tests) 12ms\n ✓ src/utils/__tests__/dateFormatter.test.ts (15 tests) 8ms\n ✓ src/types/__tests__/error.test.ts (19 tests) 6ms\n ✓ src/stores/__tests__/useAuthStore.test.ts (11 tests) 5ms\n ✓ src/lib/__tests__/permissions.test.ts (19 tests) 5ms\n ✓ src/utils/imageCompressor.test.ts (5 tests) 5ms\n ✓ src/config/__tests__/agentSuggestions.test.ts (11 tests) 6ms\n ✓ src/lib/agent/tools/__tests__/helpers.test.ts (5 tests) 3ms\n ↓ src/utils/fileHash.test.ts (5 tests | 5 skipped)\n\n Test Files  34 passed | 1 skipped (35)\n      Tests  437 passed | 5 skipped (442)\n   Start at  02:57:14\n   Duration  9.87s (transform 1.12s, setup 2.02s, import 4.41s, tests 2.40s, environment 13.04s)",
      "stderr_tail": "    at trace (file:///workspace/app/node_modules/vitest/dist/chunks/test.B8ej_ZHS.js:239:21)\n    at runTest (file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:12)\n\nstderr | src/stores/__tests__/useProfileStore.test.ts > useProfileStore > updateProfile > rolls back on failure\nFailed to update profile: Error: Update failed\n    at /workspace/app/src/stores/__tests__/useProfileStore.test.ts:79:58\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:145:11\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:915:26\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1243:20\n    at new Promise (<anonymous>)\n    at runWithTimeout (file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1209:10)\n    at file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:37\n    at Traces.$ (file:///workspace/app/node_modules/vitest/dist/chunks/traces.CCmnQaNT.js:142:27)\n    at trace (file:///workspace/app/node_modules/vitest/dist/chunks/test.B8ej_ZHS.js:239:21)\n    at runTest (file:///workspace/app/node_modules/@vitest/runner/dist/index.js:1653:12)\n\nERROR: Coverage for lines (28.54%) does not meet global threshold (80%)\nERROR: Coverage for functions (28.12%) does not meet global threshold (80%)\nERROR: Coverage for statements (28.07%) does not meet global threshold (80%)\nERROR: Coverage for branches (21.03%) does not meet global threshold (80%)"
    },
    "coverage_pct": 28.54,
    "coverage_detail": {
      "lines": 28.54,
      "statements": 28.07,
      "branches": 21.03,
      "functions": 28.12
    }
  }
}
```
