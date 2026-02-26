# IHS 仓库驾驭评测报告

- 生成时间: 2026-02-26 08:49:09 UTC
- 分析分支: `cursor/-bc-96d35c3d-f146-409d-a9bf-f451d660ee61-5d6d`
- 当前提交: `bb3dc82`
- 评测框架: IHS (IDE Harness Score)，参考 OpenAI Harness Engineering 的“约束 + 评测 + 回归”闭环。
- 评测输出: `IHS.md`

## 1) 总览结论

- **IHS 总分**: **74.8/100**
- **仓库状态**: **可控（好）**
- **趋势判断（对比 HEAD~1）**: **持平**
- 静态趋势分: 当前 `77.0` vs 上一提交 `77.0` (Δ `0.0`)

| 维度 | 分数 | 权重 |
| --- | ---: | ---: |
| 代码腐化度 | 93.5 | 40% |
| 测试信号 | 40.8 | 35% |
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

- 测试文件数: `27`
- 测试/源码比: `0.153`
- 覆盖率摘要: lines=21.25%, statements=21.06%, branches=15.59%, functions=22.05%

| 检查项 | 命令 | 结果 | 耗时(s) |
| --- | --- | --- | ---: |
| Type Check | `npm run type-check` | `pass` | 0.14 |
| Unit Test | `npm run test` | `pass` | 5.24 |
| Coverage | `npm run coverage -- --coverage.reporter=json-summary` | `fail` | 6.54 |

## 4) 文档对齐（Docs Alignment）

- 文档存在率: `5/6`
- 近历史窗口文档对齐率: `2/1` = `2.0`
- 文档新鲜度（<=120 天）: `5/5`

## 5) 技术债结论（变好/变坏）

- 最终判断: **好**
- 趋势判断: **持平**
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
    "overall": 74.8,
    "corrosion": 93.5,
    "testing": 40.8,
    "docs": 92.5,
    "static_current": 77.0,
    "static_previous": 77.0,
    "trend_delta": 0.0,
    "trend": "持平"
  },
  "metrics": {
    "source_files": 177,
    "test_files": 27,
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
    "docs_commits": 2,
    "ratio": 2.0
  },
  "doc_freshness": {
    "present_docs": 5,
    "fresh_docs": 5,
    "fresh_ratio": 1.0,
    "days_old": {
      "AGENTS.md": 0.0,
      "README.md": 23.2,
      "docs/Architecture.md": 23.2,
      "docs/Epics.yaml": 23.2,
      "app/README.md": 23.2
    }
  },
  "runtime": {
    "commands": [
      {
        "status": "pass",
        "returncode": 0,
        "duration_seconds": 0.14,
        "command": "npm run type-check",
        "cwd": "/workspace/app",
        "stdout_tail": "> opc-starter@1.0.0 type-check\n> tsc --noEmit",
        "stderr_tail": ""
      },
      {
        "status": "pass",
        "returncode": 0,
        "duration_seconds": 5.24,
        "command": "npm run test",
        "cwd": "/workspace/app",
        "stdout_tail": "\nstdout | src/lib/agent/tools/registry.test.ts > executeToolByName > should return error for unknown tool\n[ToolRegistry] executeToolByName: unknownTool {}\n\nstdout | src/lib/agent/tools/registry.test.ts > executeToolByName > should validate params for executeToolByName\n[ToolRegistry] executeToolByName: validatedTool {}\n\n ✓ src/lib/agent/tools/registry.test.ts (9 tests) 9ms\n ✓ src/components/agent/a2ui/__tests__/utils.test.ts (12 tests) 6ms\n ✓ src/types/__tests__/error.test.ts (19 tests) 5ms\n ✓ src/lib/agent/tools/navigation/index.test.ts (8 tests) 5ms\n ✓ src/lib/agent/tools/_template/index.test.ts (9 tests) 5ms\n ✓ src/utils/imageCompressor.test.ts (5 tests) 4ms\n ✓ src/config/__tests__/agentSuggestions.test.ts (11 tests) 4ms\n ↓ src/utils/fileHash.test.ts (5 tests | 5 skipped)\n\n Test Files  21 passed | 1 skipped (22)\n      Tests  268 passed | 5 skipped (273)\n   Start at  08:48:58\n   Duration  4.91s (transform 824ms, setup 725ms, import 2.10s, tests 1.96s, environment 7.47s)",
        "stderr_tail": "stderr | src/components/agent/a2ui/__tests__/A2UIRenderer.test.tsx > A2UIRenderer - 未知组件处理 > 渲染未知组件类型的警告\n[A2UI] 未知组件类型: unknown-type\n\nstderr | src/components/agent/a2ui/__tests__/A2UIRenderer.test.tsx > A2UIRenderer - 未知组件处理 > 显示未知组件的 ID\n[A2UI] 未知组件类型: invalid-component\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 失败后重试\n[SSE] 第 1 次重试，1000ms 后... First fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 达到最大重试次数后抛出错误\n[SSE] 第 1 次重试，1000ms 后... Always fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 达到最大重试次数后抛出错误\n[SSE] 第 2 次重试，2000ms 后... Always fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 达到最大重试次数后抛出错误\n[SSE] 第 3 次重试，4000ms 后... Always fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 调用重试回调\n[SSE] 第 1 次重试，1000ms 后... First fail"
      },
      {
        "status": "fail",
        "returncode": 1,
        "duration_seconds": 6.54,
        "command": "npm run coverage -- --coverage.reporter=json-summary",
        "cwd": "/workspace/app",
        "stdout_tail": "\nstdout | src/lib/agent/tools/registry.test.ts > executeToolByName > should return error for unknown tool\n[ToolRegistry] executeToolByName: unknownTool {}\n\nstdout | src/lib/agent/tools/registry.test.ts > executeToolByName > should validate params for executeToolByName\n[ToolRegistry] executeToolByName: validatedTool {}\n\n ✓ src/lib/agent/tools/registry.test.ts (9 tests) 10ms\n ✓ src/components/agent/a2ui/__tests__/utils.test.ts (12 tests) 6ms\n ✓ src/lib/agent/tools/navigation/index.test.ts (8 tests) 7ms\n ✓ src/types/__tests__/error.test.ts (19 tests) 6ms\n ✓ src/lib/agent/tools/_template/index.test.ts (9 tests) 5ms\n ✓ src/utils/imageCompressor.test.ts (5 tests) 5ms\n ✓ src/config/__tests__/agentSuggestions.test.ts (11 tests) 4ms\n ↓ src/utils/fileHash.test.ts (5 tests | 5 skipped)\n\n Test Files  21 passed | 1 skipped (22)\n      Tests  268 passed | 5 skipped (273)\n   Start at  08:49:03\n   Duration  6.08s (transform 826ms, setup 1.10s, import 2.34s, tests 2.25s, environment 7.50s)",
        "stderr_tail": "\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 失败后重试\n[SSE] 第 1 次重试，1000ms 后... First fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 达到最大重试次数后抛出错误\n[SSE] 第 1 次重试，1000ms 后... Always fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 达到最大重试次数后抛出错误\n[SSE] 第 2 次重试，2000ms 后... Always fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 达到最大重试次数后抛出错误\n[SSE] 第 3 次重试，4000ms 后... Always fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 调用重试回调\n[SSE] 第 1 次重试，1000ms 后... First fail\n\nERROR: Coverage for lines (21.25%) does not meet global threshold (80%)\nERROR: Coverage for functions (22.05%) does not meet global threshold (80%)\nERROR: Coverage for statements (21.06%) does not meet global threshold (80%)\nERROR: Coverage for branches (15.59%) does not meet global threshold (80%)"
      }
    ],
    "type_check": {
      "status": "pass",
      "returncode": 0,
      "duration_seconds": 0.14,
      "command": "npm run type-check",
      "cwd": "/workspace/app",
      "stdout_tail": "> opc-starter@1.0.0 type-check\n> tsc --noEmit",
      "stderr_tail": ""
    },
    "unit_test": {
      "status": "pass",
      "returncode": 0,
      "duration_seconds": 5.24,
      "command": "npm run test",
      "cwd": "/workspace/app",
      "stdout_tail": "\nstdout | src/lib/agent/tools/registry.test.ts > executeToolByName > should return error for unknown tool\n[ToolRegistry] executeToolByName: unknownTool {}\n\nstdout | src/lib/agent/tools/registry.test.ts > executeToolByName > should validate params for executeToolByName\n[ToolRegistry] executeToolByName: validatedTool {}\n\n ✓ src/lib/agent/tools/registry.test.ts (9 tests) 9ms\n ✓ src/components/agent/a2ui/__tests__/utils.test.ts (12 tests) 6ms\n ✓ src/types/__tests__/error.test.ts (19 tests) 5ms\n ✓ src/lib/agent/tools/navigation/index.test.ts (8 tests) 5ms\n ✓ src/lib/agent/tools/_template/index.test.ts (9 tests) 5ms\n ✓ src/utils/imageCompressor.test.ts (5 tests) 4ms\n ✓ src/config/__tests__/agentSuggestions.test.ts (11 tests) 4ms\n ↓ src/utils/fileHash.test.ts (5 tests | 5 skipped)\n\n Test Files  21 passed | 1 skipped (22)\n      Tests  268 passed | 5 skipped (273)\n   Start at  08:48:58\n   Duration  4.91s (transform 824ms, setup 725ms, import 2.10s, tests 1.96s, environment 7.47s)",
      "stderr_tail": "stderr | src/components/agent/a2ui/__tests__/A2UIRenderer.test.tsx > A2UIRenderer - 未知组件处理 > 渲染未知组件类型的警告\n[A2UI] 未知组件类型: unknown-type\n\nstderr | src/components/agent/a2ui/__tests__/A2UIRenderer.test.tsx > A2UIRenderer - 未知组件处理 > 显示未知组件的 ID\n[A2UI] 未知组件类型: invalid-component\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 失败后重试\n[SSE] 第 1 次重试，1000ms 后... First fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 达到最大重试次数后抛出错误\n[SSE] 第 1 次重试，1000ms 后... Always fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 达到最大重试次数后抛出错误\n[SSE] 第 2 次重试，2000ms 后... Always fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 达到最大重试次数后抛出错误\n[SSE] 第 3 次重试，4000ms 后... Always fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 调用重试回调\n[SSE] 第 1 次重试，1000ms 后... First fail"
    },
    "coverage": {
      "status": "fail",
      "returncode": 1,
      "duration_seconds": 6.54,
      "command": "npm run coverage -- --coverage.reporter=json-summary",
      "cwd": "/workspace/app",
      "stdout_tail": "\nstdout | src/lib/agent/tools/registry.test.ts > executeToolByName > should return error for unknown tool\n[ToolRegistry] executeToolByName: unknownTool {}\n\nstdout | src/lib/agent/tools/registry.test.ts > executeToolByName > should validate params for executeToolByName\n[ToolRegistry] executeToolByName: validatedTool {}\n\n ✓ src/lib/agent/tools/registry.test.ts (9 tests) 10ms\n ✓ src/components/agent/a2ui/__tests__/utils.test.ts (12 tests) 6ms\n ✓ src/lib/agent/tools/navigation/index.test.ts (8 tests) 7ms\n ✓ src/types/__tests__/error.test.ts (19 tests) 6ms\n ✓ src/lib/agent/tools/_template/index.test.ts (9 tests) 5ms\n ✓ src/utils/imageCompressor.test.ts (5 tests) 5ms\n ✓ src/config/__tests__/agentSuggestions.test.ts (11 tests) 4ms\n ↓ src/utils/fileHash.test.ts (5 tests | 5 skipped)\n\n Test Files  21 passed | 1 skipped (22)\n      Tests  268 passed | 5 skipped (273)\n   Start at  08:49:03\n   Duration  6.08s (transform 826ms, setup 1.10s, import 2.34s, tests 2.25s, environment 7.50s)",
      "stderr_tail": "\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 失败后重试\n[SSE] 第 1 次重试，1000ms 后... First fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 达到最大重试次数后抛出错误\n[SSE] 第 1 次重试，1000ms 后... Always fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 达到最大重试次数后抛出错误\n[SSE] 第 2 次重试，2000ms 后... Always fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 达到最大重试次数后抛出错误\n[SSE] 第 3 次重试，4000ms 后... Always fail\n\nstderr | src/lib/agent/__tests__/sseClient.test.ts > withRetry > 调用重试回调\n[SSE] 第 1 次重试，1000ms 后... First fail\n\nERROR: Coverage for lines (21.25%) does not meet global threshold (80%)\nERROR: Coverage for functions (22.05%) does not meet global threshold (80%)\nERROR: Coverage for statements (21.06%) does not meet global threshold (80%)\nERROR: Coverage for branches (15.59%) does not meet global threshold (80%)"
    },
    "coverage_pct": 21.25,
    "coverage_detail": {
      "lines": 21.25,
      "statements": 21.06,
      "branches": 15.59,
      "functions": 22.05
    }
  }
}
```
