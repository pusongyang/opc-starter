# 阿里云部署指南

> OPC-Starter 一人公司启动器 | 阿里云 ESA Pages + Supabase 部署方案
>
> 适用版本: v1.1+ | 最后更新: 2026-04

---

## 📋 目录

- [架构概览](#架构概览)
- [部署前确认](#部署前确认)
- [快速部署](#快速部署)
- [详细部署步骤](#详细部署步骤)
  - [Step 1: 初始化 Supabase](#step-1-初始化-supabase)
  - [Step 2: 部署 ai-assistant Edge Function](#step-2-部署-ai-assistant-edge-function)
  - [Step 3: 构建并发布前端](#step-3-构建并发布前端)
- [环境变量与 Secret 对照表](#环境变量与-secret-对照表)
- [自定义域名配置](#自定义域名配置)
- [安全最佳实践](#安全最佳实践)
- [故障排除](#故障排除)

---

## 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户浏览器                                │
└─────────────────────────────────────┬───────────────────────────┘
                                      │ HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    阿里云 ESA Pages                              │
│                    (静态资源托管)                                │
│                    - React SPA                                   │
│                    - 全球 CDN 加速                               │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    ▼                                   ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│      Supabase (ADB-PG)        │   │      阿里云百炼 AI            │
│      - PostgreSQL 数据库       │   │      - Qwen-Plus 模型          │
│      - 用户认证 Auth           │   │      - OpenAI SDK 兼容        │
│      - 文件存储 Storage        │   │      - Agent 智能助手         │
│      - Edge Functions          │   │                               │
│      - Realtime 实时同步       │   │                               │
└───────────────────────────────┘   └───────────────────────────────┘
```

**技术栈版本:**
| 组件 | 版本 | 说明 |
|------|------|------|
| React | 19.1 | 前端框架 |
| TypeScript | 5.9 | 类型安全 |
| Vite | 7.1 | 构建工具 |
| Tailwind CSS | 4.1 | 样式框架 |
| Supabase | 2.80 | BaaS 后端 |
| Qwen-Plus | via 百炼 | AI 模型（通义千问） |

---

## 部署前确认

### 必需账号

| 服务 | 用途 | 注册链接 |
|------|------|----------|
| 阿里云账号 | ESA Pages + 百炼 AI | [注册](https://account.aliyun.com/register/register.htm) |
| Supabase 账号 | 数据库 + 认证 + 存储 | [注册](https://supabase.com/) |

### 本地环境

```bash
# 检查 Node.js 版本 (需要 >= 20.x)
node -v

# 检查 npm 版本 (需要 >= 10.x)  
npm -v

# 检查 Git
git --version
```

### 预估费用

| 服务 | 免费额度 | 超出费用 |
|------|----------|----------|
| Supabase | 500MB 数据库, 1GB 存储 | $25/月起 |
| ESA Pages | 100GB 流量/月 | ¥0.24/GB |
| 百炼 AI | 新用户赠送额度 | 按 Token 计费 |

---

## 快速部署

以下步骤对应当前仓库的真实运行链路：

1. 在 Supabase SQL Editor 执行 `app/supabase/setup.sql`。
2. 使用 Supabase CLI 部署 `app/supabase/functions/ai-assistant`，并配置 `ALIYUN_BAILIAN_API_KEY`。
3. 在 `app/.env.local` 中写入前端所需的 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`。
4. 在 `app/` 下执行 `npm run build`，然后用 `esa-cli deploy` 发布 `app/dist`。

建议先在本地完成一次最小验证：

```bash
cp app/.env.example app/.env.local
npm run build
```

---

## 详细部署步骤

### Step 1: 初始化 Supabase

#### 1.1 创建 Supabase 项目

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 **New Project**
3. 填写项目信息:
   - **Name**: `opc-starter-prod` (自定义名称)
   - **Database Password**: 设置强密码并妥善保存
   - **Region**: 选择最近的区域 (如 Southeast Asia - Singapore)
4. 等待项目创建完成 (约 2 分钟)

#### 1.2 初始化数据库 Schema

1. 进入 **SQL Editor**
2. 点击 **New query**
3. 复制粘贴 `app/supabase/setup.sql` 的全部内容
4. 点击 **Run** 执行

> 💡 **提示**: 脚本会创建 `profiles`、`organizations`、`organization_members`、`agent_threads`、`agent_messages`、`agent_actions` 等表，并配置 RLS 安全策略。

#### 1.3 配置 Storage Bucket

1. 进入 **Storage**
2. 点击 **Create a new bucket**
3. 创建以下 Bucket:

| Bucket 名称 | 公开访问 | 用途 |
|-------------|----------|------|
| `avatars` | ✅ Public | 用户头像 |
| `uploads` | ❌ Private | 通用上传文件 |

#### 1.4 获取项目凭证

进入 **Settings → API**，记录以下信息:

```yaml
# 保存到安全位置
SUPABASE_URL: https://xxxxx.supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # 仅后端使用
```

### Step 2: 部署 ai-assistant Edge Function

```bash
cd app
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase functions deploy ai-assistant
npx supabase secrets set ALIYUN_BAILIAN_API_KEY=sk-xxx
```

#### 2.1 开通百炼服务

1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 如未开通，点击 **开通服务** (按量付费)
3. 完成实名认证 (如需)

#### 2.2 创建 API Key

1. 进入 **API-KEY 管理**: [直达链接](https://bailian.console.aliyun.com/cn-beijing/?tab=model#/api-key)
2. 点击 **创建新的 API-KEY**
3. 设置名称: `opc-starter-prod`
4. 复制生成的 Key (格式: `sk-xxx`)

> ⚠️ **安全提醒**: API Key 只显示一次，请立即保存到安全位置。

#### 2.3 配置到 Supabase Edge Functions

**方式一: 通过 Dashboard (推荐新手)**

1. Supabase Dashboard → **Edge Functions**
2. 点击 **Secrets** 标签
3. **Add new secret**:
   - Name: `ALIYUN_BAILIAN_API_KEY`
   - Value: `sk-xxx` (你的百炼 API Key)

**方式二: 通过 CLI**

```bash
npx supabase secrets set ALIYUN_BAILIAN_API_KEY=sk-xxx
```

#### 2.4 验证配置

```bash
# 测试 Edge Function
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-assistant' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"你好"}],"context":{"currentPage":"dashboard"}}'
```

---

### Step 3: 构建并发布前端

#### 3.1 安装 ESA CLI

```bash
# 全局安装 ESA CLI
npm install esa-cli@latest -g

# 验证安装
esa-cli --version
```

#### 3.2 配置阿里云访问凭证

```bash
# 登录 (需要阿里云 AccessKey)
esa-cli login
```

**获取 AccessKey:**

1. 访问 [AccessKey 管理](https://ram.console.aliyun.com/manage/ak)
2. 创建 AccessKey (建议使用 RAM 子账号)
3. 记录 AccessKey ID 和 AccessKey Secret

> ⚠️ **安全提醒**: 
> - 不要使用主账号 AccessKey
> - 建议创建专用 RAM 用户并仅授予 ESA 权限
> - 设置 AccessKey 轮转策略

#### 3.3 配置前端环境变量

```bash
cd app

# 复制环境变量模板
cp .env.example .env.local

# 编辑配置
nano .env.local  # 或使用你喜欢的编辑器
```

**`.env.local` 配置内容:**

```bash
# Supabase 配置 (必需)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# 可选开发开关
VITE_ENABLE_MSW=false
# VITE_MOCK_DATA_ENABLED=true
# VITE_LOG_LEVEL=info
```

#### 3.4 构建项目

```bash
npm install
npm run build
npm run preview
```

#### 3.5 部署到 ESA Pages

**查看部署配置:**

```bash
cat esa.jsonc
```

当前仓库内置的 `app/esa.jsonc` 指向：

- `name: "opc-starter"`
- `assets.directory: "./dist"`
- `assets.notFoundStrategy: "singlePageApplication"`

**执行部署:**

```bash
esa-cli deploy
```

**部署成功输出示例:**

```
✔ Deployment successful!
  Site URL: https://opc-starter.esa.aliyun.com
  Deploy ID: deploy_xxxxx
```

---

## 环境变量与 Secret 对照表

### 前端环境变量 (`.env.local`)

| 变量名 | 必需 | 说明 | 示例值 |
|--------|------|------|--------|
| `VITE_SUPABASE_URL` | ✅ | Supabase 项目 URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名 Key | `eyJxxx...` |
| `VITE_ENABLE_MSW` | ❌ | 本地是否启用 MSW Mock | `false` |
| `VITE_MOCK_DATA_ENABLED` | ❌ | 本地 mock 数据开关 | `true` |
| `VITE_LOG_LEVEL` | ❌ | 日志级别 | `info` |

### Edge Function Secrets

| Secret 名称 | 必需 | 说明 | 获取方式 |
|-------------|------|------|----------|
| `ALIYUN_BAILIAN_API_KEY` | ✅ | 百炼 AI API Key | [百炼控制台](https://bailian.console.aliyun.com/cn-beijing/?tab=model#/api-key) |
| `SUPABASE_URL` | 🔄 | 自动注入 | - |
| `SUPABASE_ANON_KEY` | 🔄 | 自动注入 | - |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔄 | 自动注入 | - |

> 🔄 = Supabase 自动注入，无需手动配置
>
> 当前前端不读取 `VITE_DASHSCOPE_API_KEY`、`VITE_OSS_*` 或 `DASHSCOPE_API_KEY`；这些旧变量不要再放入部署模板。

---

## 自定义域名配置

### 前提条件

- 已完成域名备案 (中国大陆访问必需)
- 域名 DNS 托管或可修改 DNS 记录

### 配置步骤

1. **获取 ESA Pages 默认域名**
   
   部署成功后会分配一个 `xxx.esa.aliyun.com` 域名

2. **添加自定义域名**
   
   - 访问 [ESA 控制台](https://esa.console.aliyun.com/)
   - 进入你的站点 → **域名管理**
   - 点击 **添加域名**
   - 输入你的域名 (如 `app.yourdomain.com`)

3. **配置 DNS 解析**
   
   添加 CNAME 记录指向 ESA 提供的地址:
   
   | 主机记录 | 记录类型 | 记录值 |
   |----------|----------|--------|
   | `app` | CNAME | `xxx.esa.aliyun.com` |

4. **配置 HTTPS 证书**
   
   ESA 支持自动申请免费证书，或上传自有证书

5. **更新 Supabase 配置**
   
   如果使用自定义域名，记得在 Supabase Dashboard 中:
   - **Authentication → URL Configuration** 更新 Site URL
   - **Authentication → Redirect URLs** 添加新域名

---

## 安全最佳实践

### 1. Supabase 与 RLS 安全

```yaml
# 推荐配置
- 开启 Read-Only 模式 (除非必要)
- 启用 RLS (Row Level Security) - 默认已启用
- 定期审计 RLS 策略
```

### 2. 百炼 API Key 安全

```yaml
# 推荐配置
- 为不同环境创建不同的 API Key
- 设置 API Key 调用限额
- 定期轮转 Key (建议每 90 天)
- 监控异常调用量
```

### 3. 阿里云 AccessKey 安全

```yaml
# 强烈推荐
- ❌ 不要使用主账号 AccessKey
- ✅ 创建 RAM 子账号
- ✅ 仅授予必要权限 (最小权限原则)
- ✅ 设置 AccessKey 轮转策略
- ✅ 启用 MFA 多因素认证
```

**创建专用 RAM 用户:**

```bash
# RAM 策略示例 - 仅 ESA Pages 权限
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "esa:*",
      "Resource": "*"
    }
  ]
}
```

### 4. 生产环境检查清单

- [ ] 关闭前端 MSW Mock (`VITE_ENABLE_MSW=false`)
- [ ] 如有需要再开启 `VITE_MOCK_DATA_ENABLED`
- [ ] 设置适当的日志级别 (`VITE_LOG_LEVEL=info` 或 `warn`)
- [ ] 确认 Supabase RLS 策略正确配置
- [ ] 确认 Edge Function Secrets 已配置
- [ ] 配置 HTTPS (ESA 默认支持)
- [ ] 设置 CORS 策略 (Edge Function 已配置)

---

## 故障排除

### 问题 1: ESA 部署失败

**症状:** `esa-cli deploy` 报错

**排查步骤:**

```bash
# 1. 检查登录状态
esa-cli whoami

# 2. 重新登录
esa-cli login

# 3. 检查构建产物
ls -la dist/

# 4. 验证 esa.jsonc 配置
cat esa.jsonc
```

### 问题 2: AI 助手无响应

**症状:** Agent 对话无回复或报错

**排查步骤:**

```bash
# 1. 检查 Edge Function 日志
npx supabase functions logs ai-assistant

# 2. 验证 Secret 配置
npx supabase secrets list

# 3. 测试百炼 API 连通性
curl -X POST 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions' \
  -H 'Authorization: Bearer sk-xxx' \
  -H 'Content-Type: application/json' \
  -d '{"model":"qwen-plus","messages":[{"role":"user","content":"test"}]}'
```

### 问题 3: 登录/认证失败

**症状:** 无法登录或 Session 丢失

**排查步骤:**

1. 检查 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确
2. 确认 Supabase Dashboard → Authentication → URL Configuration 设置正确
3. 检查浏览器控制台是否有 CORS 错误

### 问题 4: 数据库连接错误

**症状:** 页面显示 "Failed to fetch" 或类似错误

**排查步骤:**

1. 确认 Supabase 项目状态为 Active
2. 检查 RLS 策略是否正确配置
3. 验证 Anon Key 是否匹配当前项目

---

## 获取帮助

- `README.md`：本地启动与日常开发
- `app/supabase/SUPABASE_COOKBOOK.md`：数据库与 Edge Function 操作
- `docs/API.md` / `docs/Swagger.yml`：`ai-assistant` 接口契约

---

<p align="center">
  <sub>Made with ❤️ for Solo Entrepreneurs</sub>
</p>
