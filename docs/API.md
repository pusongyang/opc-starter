# AI Assistant API 文档

> Edge Function 接口说明 | v2.1.0

## 概述

当前分支对外暴露的机器可读接口只有一个：`POST /functions/v1/ai-assistant`。它部署为 Supabase Edge Function，使用 SSE (`text/event-stream`) 流式返回结果。

## 文档分工

| 文档 | 用途 |
| --- | --- |
| `docs/API.md` | 面向研发与联调的文字说明 |
| `docs/Swagger.yml` | 面向工具链与上下游的 OpenAPI 契约 |
| `docs/OPENAPI-LIST.md` | 当前仓库对外接口索引与真相源映射 |
| `docs/crawfish-template.schema.json` | 当前请求/上下文/工具参数的 JSON Schema 兼容契约 |

## 请求约定

### 端点

`POST /functions/v1/ai-assistant`

### 请求头

| 头部 | 必填 | 说明 |
| --- | --- | --- |
| `Authorization` | 是 | `Bearer <supabase_access_token>` |
| `Content-Type` | 是 | `application/json` |

### 请求体

- `messages`: 必填，至少 1 条消息。
- `context`: 可选，携带 `currentPage` 与 `viewContext`。
- `threadId`: 可选，会原样带到后端日志与后续会话链路。

当前 `currentPage` 枚举：`dashboard`、`persons`、`profile`、`settings`、`cloud-storage`、`other`。

## SSE 事件

| 事件 | 说明 |
| --- | --- |
| `text_delta` | 增量文本输出 |
| `tool_call` | 请求前端执行本地工具 |
| `a2ui` | 生成 A2UI 组件树 |
| `done` | 对话完成，携带 token 用量 |
| `error` | 处理失败 |
| `interrupted` | 被用户中断 |

## 当前工具面

| 工具 | 参数 |
| --- | --- |
| `navigateToPage` | `page`: `home` / `persons` / `profile` / `settings` / `storage` |
| `getCurrentContext` | 无参数 |
| `renderUI` | `component` 必填，可选 `surfaceId`、`dataModel` |

## 错误码

| HTTP 状态码 | 说明 |
| --- | --- |
| `400` | `messages` 为空 |
| `401` | 缺少或无效的 `Authorization` |
| `405` | 非 `POST` 请求 |
| `500` | 服务端异常，例如缺少 `ALIYUN_BAILIAN_API_KEY` |

## 备注

- 当前仓库没有 `migrate/*.sql`，数据库结构以 `app/supabase/setup.sql` 为准。
- 当前仓库没有 `crawfishSchemaReference.ts` 与 `CreatePolarClawWizard.tsx`；如后续补齐运行时代码，需同步更新 JSON Schema 与 Release Notes。
