# OPC-Starter 改进计划

> 基于 IHS 仓库驾驭评测报告的改进路线图

## 当前状态（2026-03-07）

| 维度 | 分数 | 目标 | 状态 |
|------|------|------|------|
| **IHS 总分** | **77.7** | ≥ 85 | 🟡 可控 |
| 代码腐化度 | 93.5 | ≥ 90 | ✅ 达标 |
| 测试信号 | 49.2 | ≥ 70 | 🔴 需提升 |
| 文档对齐 | 92.5 | ≥ 85 | ✅ 达标 |
| 趋势 | Δ +6.3 | > 0 | ✅ 变好 |

### 关键指标

- 测试文件数: 40 / 源码文件数: 177（比率 0.226，目标 ≥ 0.35）
- 覆盖率: lines 28.5%, branches 21.0%, functions 28.1%
- `any` 使用: 10 处（目标 ≤ 5）
- `eslint-disable`: 8 处（目标 ≤ 3）
- 超大文件: 5 个（目标 ≤ 3）

## 已完成改进

### 本轮新增测试（+13 个测试文件，+120+ 测试用例）

| 核心模块 | 测试文件 | 覆盖内容 |
|----------|----------|----------|
| 权限系统 | `lib/__tests__/permissions.test.ts` | hasPermission, checkPermission, canEdit/Delete |
| 内存缓存 | `services/cache/__tests__/memoryCache.test.ts` | get/set/TTL/getOrFetch/invalidate |
| 冲突解决 | `services/data/conflict/__tests__/conflictResolver.test.ts` | 版本冲突、tag 合并、统计 |
| 网络管理 | `services/data/network/__tests__/networkManager.test.ts` | online/offline 事件监听 |
| 离线队列 | `services/data/offline-queue/__tests__/offlineQueueManager.test.ts` | 入队/处理/重试/持久化 |
| 上下文压缩 | `lib/agent/__tests__/contextCompressor.test.ts` | Token 估算/压缩策略 |
| A2UI 处理器 | `lib/agent/__tests__/a2uiActionHandler.test.ts` | 导航/已移除功能/未知 action |
| 工具 Helpers | `lib/agent/tools/__tests__/helpers.test.ts` | createSuccess/Error/UIResult |
| 认证 Store | `stores/__tests__/useAuthStore.test.ts` | signIn/signUp/signOut/initialize |
| Profile Store | `stores/__tests__/useProfileStore.test.ts` | loadProfile/optimistic update/rollback |
| UI Store | `stores/__tests__/useUIStore.test.ts` | loading/modal/toast |
| 表单验证 | `types/__tests__/validation.test.ts` | profileSchema/avatar 验证 |
| 日期格式化 | `utils/__tests__/dateFormatter.test.ts` | formatDate/Relative/Label |

### Core vs Edge 测试策略

- **Core 优先**: 所有核心模块（stores, services, lib/agent, lib/reactive）已有测试覆盖
- **Edge 延后**: UI 页面、布局组件、纯展示组件等边缘代码暂不强制覆盖

## 下一步改进计划

### Phase 1: 测试信号提升（目标: 测试分 ≥ 70）

1. [ ] 补充 `services/api/` 层单测（personService, profileService, organizationService）
2. [ ] 补充 `hooks/useAgentChat.ts`, `hooks/useOrganization.ts` 测试
3. [ ] 补充 `lib/agent/sessionStorage.ts`, `lib/agent/userPreferences.ts` 测试（需 fake-indexeddb）
4. [ ] 将覆盖率阈值逐步提升: 30% → 50% → 65%

### Phase 2: 代码腐化度优化（维持 ≥ 90）

5. [ ] 消减 `any` 使用（10 → ≤ 5），用 `unknown` + 类型守卫替代
6. [ ] 消减 `eslint-disable`（8 → ≤ 3），修复根因而非压制
7. [ ] 拆分超大文件（5 → ≤ 3），如 `useAgentStore.ts`（433行）、`organizationService.ts`（494行）

### Phase 3: 文档对齐维持（保持 ≥ 85）

8. [ ] 每次核心代码变更同步更新 `docs/` 与 `AGENTS.md`
9. [ ] 添加 `app/supabase/SUPABASE_COOKBOOK.md`（当前缺失）

## IHS 评分趋势

| 日期 | 总分 | 腐化度 | 测试信号 | 文档对齐 | 趋势 |
|------|------|--------|----------|----------|------|
| 2026-02-26 | 77.1 | 93.5 | 47.4 | 92.5 | 持平 |
| **2026-03-07** | **77.7** | **93.5** | **49.2** | **92.5** | **变好 Δ+6.3** |
