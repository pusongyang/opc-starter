# Release Notes

## 本期目标

本期聚焦仓库漂移治理：统一源码、测试、数据库结构、OpenAPI 文档、JSON Schema 约束与部署文档的权威来源，清理无效模板与孤岛文件，补齐自动化漂移校验。

## 功能与维护项

### 1. API 契约治理

- 新增 `docs/Swagger.yml`，将 `ai-assistant` Edge Function 的请求、SSE 响应事件、错误码和安全头收敛为机器可读 OpenAPI 契约。
- 新增 `docs/OPENAPI-LIST.md`，列出当前受支持的 OpenAPI 文档、实现来源和维护规则。
- 更新 `docs/API.md`，使文字版 API 说明与 `Swagger.yml`、前后端实现保持一致。

### 2. JSON Schema 对齐

- 新增 `docs/crawfish-template.schema.json`，将当前仓库实际存在的 Agent 契约抽象为 `agent-runtime-contract` schema，用于约束上下文、工具定义与 SSE 事件。
- 新增 `app/src/test/documentationDrift.test.ts`，自动校验 OpenAPI、Schema、环境模板与源码实现是否漂移。

### 3. 数据结构与数据库手册修正

- 修正 `app/supabase/setup.sql` 文件头摘要，反映真实的 6 张核心业务表。
- 更新 `app/supabase/SUPABASE_COOKBOOK.md`，移除不存在的 `persons` 表和 `admin_delete_organization()` 示例，补齐 Agent 相关表说明。

### 4. 环境与部署流程收敛

- 将 `app/.env.example` 收敛为唯一前端环境模板，明确真实 Supabase 模式、MSW 模式与 Edge Function Secret 的边界。
- 更新根目录 `README.md` 与 `app/README.md`，移除未被源码使用的 `VITE_DASHSCOPE_API_KEY` 和旧模板引用。
- 更新 `ALIYUN-DEPLOY.md`，对齐当前可运行部署链路、真实环境变量和 ESA/Supabase 配置步骤。
- 修正 `app/esa.jsonc` 中的项目名拼写。
- 更新 `app/setup-env.sh`，统一从 `.env.example` 生成 `.env.local`。

### 5. 僵尸 / 孤岛文件清理

已移除以下无效或重复文件：

- `app/env.local.example`
- `app/env.${locus}`
- `app/CHANGELOG.md`

## 需要通知上下游的文档变更

以下文件发生了对接面变化，请通知依赖这些文档的上下游同步更新：

- `docs/OPENAPI-LIST.md`
- `docs/Swagger.yml`
- `docs/crawfish-template.schema.json`
- `app/.env.example`
- `ALIYUN-DEPLOY.md`

## 升级提示

- 真实部署与本地真实联调统一改为从 `app/.env.example` 复制生成 `app/.env.local`。
- `ALIYUN_BAILIAN_API_KEY` 仅作为 Supabase Edge Function Secret 配置，不再在前端环境模板中出现。
- 如果外部流程仍引用 `app/env.local.example` 或 `VITE_DASHSCOPE_API_KEY`，请立即切换到新文档说明。
