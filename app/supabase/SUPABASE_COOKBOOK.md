# Supabase 操作手册

> OPC-Starter 数据库与 Edge Functions 操作指南 | v1.1

## 概述

本项目使用 Supabase 承载 Auth、Postgres、Storage、Realtime 和 Edge Functions。数据库结构变更统一收敛到 `app/supabase/setup.sql`，当前仓库没有独立 `migrate/*.sql` 迁移目录。

## 当前数据库结构

以 `setup.sql` 为准，核心表如下：

| 表 | 说明 |
| --- | --- |
| `profiles` | 用户档案，扩展 `auth.users` |
| `organizations` | 组织架构，支持 `ltree` 树形层级 |
| `organization_members` | 用户与组织关系 |
| `agent_threads` | Agent 会话线程 |
| `agent_messages` | Agent 消息记录 |
| `agent_actions` | Agent 工具调用与动作日志 |

## 常用查询

### 查询用户所属组织

```sql
SELECT p.*, o.display_name AS org_name
FROM public.profiles p
LEFT JOIN public.organizations o ON p.organization_id = o.id
WHERE p.id = '<user_id>';
```

### 查询组织树

```sql
SELECT id, name, display_name, parent_id, path, level, sort_order
FROM public.organizations
ORDER BY level ASC, display_name ASC;
```

### 创建组织（需 admin 权限）

使用 `admin_create_organization()` 自动处理 `path` 与 `level`：

```sql
SELECT public.admin_create_organization(
  p_name := 'engineering',
  p_display_name := '工程部',
  p_description := '负责技术研发',
  p_parent_id := '<parent_org_id>'
);
```

### 删除组织（需 admin 权限）

删除前请确认该组织及其子组织允许被级联移除：

```sql
SELECT public.admin_delete_organization('<org_id>'::uuid);
```

### 查询当前用户可访问的组织

```sql
SELECT organization_id
FROM public.get_user_accessible_organizations('<user_id>'::uuid);
```

## RLS 策略

- 所有业务表默认启用 RLS。
- `SECURITY DEFINER` 函数只用于受控管理动作。
- 组织访问范围通过 `get_user_accessible_organizations()` 统一计算。

## Edge Functions

| 函数 | 说明 | 端点 |
| --- | --- | --- |
| `ai-assistant` | AI 助手 SSE 网关 | `POST /functions/v1/ai-assistant` |

相关接口契约见 `docs/API.md`、`docs/Swagger.yml` 与 `docs/OPENAPI-LIST.md`。

## 环境变量与 Secrets

### 前端公开变量

| 变量 | 说明 |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名 Key |
| `VITE_ENABLE_MSW` | 是否启用本地 MSW mock |
| `VITE_LOG_LEVEL` | 本地调试日志级别（可选） |

### Edge Functions Secrets

| Secret | 说明 |
| --- | --- |
| `ALIYUN_BAILIAN_API_KEY` | 百炼 API Key |
| `SUPABASE_URL` | Supabase 自动注入 |
| `SUPABASE_ANON_KEY` | Supabase 自动注入 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 自动注入 |

## 注意事项

- SQL 变更统一更新 `setup.sql`，不要另建漂移迁移文件。
- 前端不要直接保存服务端 Secret。
- 如果要发布对外接口，请同时更新 `docs/API.md`、`docs/Swagger.yml` 与 `docs/OPENAPI-LIST.md`。
