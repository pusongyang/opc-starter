# OpenAPI / JSON Schema 索引

> 当前分支对外契约清单与真相源映射

## 当前有效接口

| 标识 | 方法/路径 | 机器契约 | 文字说明 | 运行时真相源 |
| --- | --- | --- | --- | --- |
| `ai-assistant` | `POST /functions/v1/ai-assistant` | `docs/Swagger.yml` | `docs/API.md` | `app/supabase/functions/ai-assistant/index.ts` |

## 当前有效 JSON Schema

| 文件 | 用途 | 运行时关联 |
| --- | --- | --- |
| `docs/crawfish-template.schema.json` | 当前 AI 助手请求体、上下文枚举与工具参数的兼容契约 | `app/supabase/functions/ai-assistant/types.ts`、`app/supabase/functions/ai-assistant/tools.ts` |

## 已确认的分支现状

- 当前仓库没有 `migrate/*.sql`，数据库结构以 `app/supabase/setup.sql` 为准。
- 当前仓库没有 `crawfishSchemaReference.ts` 与 `CreatePolarClawWizard.tsx`；不要把它们当作当前分支的真相源。
- 前端公开环境模板以 `app/.env.example` 为准，`app/env.local.example` 已退役。

## 建议校验

在仓库根目录执行：

- `npm test -- --run src/test/documentationDrift.test.ts`
- `npm run type-check`
- `npm run test:e2e:headless`
