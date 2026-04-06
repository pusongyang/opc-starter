import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'

const WORKSPACE_ROOT = path.resolve(__dirname, '../../..')
const DOCS_ROOT = path.join(WORKSPACE_ROOT, 'docs')
const APP_ROOT = path.join(WORKSPACE_ROOT, 'app')

function read(relativePath: string): string {
  return fs.readFileSync(path.join(WORKSPACE_ROOT, relativePath), 'utf-8')
}

function extractSingleQuotedList(content: string, pattern: RegExp): string[] {
  const match = content.match(pattern)
  expect(match, `pattern not found: ${pattern}`).not.toBeNull()

  return Array.from(match![1].matchAll(/'([^']+)'/g), (item) => item[1])
}

describe('documentation drift guards', () => {
  it('Swagger 契约与 ai-assistant 运行时入口一致', () => {
    const swagger = read('docs/Swagger.yml')
    const indexTs = read('app/supabase/functions/ai-assistant/index.ts')

    expect(indexTs).toContain("if (req.method !== 'POST')")
    expect(indexTs).toContain("Deno.env.get('ALIYUN_BAILIAN_API_KEY')")
    expect(swagger).toContain('/functions/v1/ai-assistant:')
    expect(swagger).toContain('operationId: postAiAssistant')
    expect(swagger).toContain("'405':")
    expect(swagger).toContain("'500':")
    expect(swagger).toContain('text/event-stream')
  })

  it('JSON Schema 与源码枚举保持一致', () => {
    const schema = JSON.parse(read('docs/crawfish-template.schema.json')) as {
      $defs: {
        agentContext: { properties: { currentPage: { enum: string[] } } }
        navigateToPageArgs: { properties: { page: { enum: string[] } } }
      }
    }
    const sourceTypes = read('app/supabase/functions/ai-assistant/types.ts')
    const sourceTools = read('app/supabase/functions/ai-assistant/tools.ts')

    const currentPageEnum = extractSingleQuotedList(
      sourceTypes,
      /currentPage\?:\s*((?:'[^']+'\s*\|\s*)*'[^']+')/
    )
    const navigatePageEnum = extractSingleQuotedList(sourceTools, /enum:\s*(\[[^\]]+\])/)

    expect(schema.$defs.agentContext.properties.currentPage.enum).toEqual(currentPageEnum)
    expect(schema.$defs.navigateToPageArgs.properties.page.enum).toEqual(navigatePageEnum)
  })

  it('环境模板只暴露当前真实使用的前端变量', () => {
    const envExample = read('app/.env.example')

    expect(envExample).toContain('VITE_SUPABASE_URL')
    expect(envExample).toContain('VITE_SUPABASE_ANON_KEY')
    expect(envExample).toContain('VITE_ENABLE_MSW')
    expect(envExample).not.toContain('VITE_DASHSCOPE_API_KEY')
    expect(envExample).not.toContain('VITE_OSS_')
    expect(envExample).not.toContain('VITE_MOCK_DATA_ENABLED')
  })

  it('数据库说明与 setup.sql 表头保持一致', () => {
    const setupSql = read('app/supabase/setup.sql')
    const cookbook = read('app/supabase/SUPABASE_COOKBOOK.md')

    expect(setupSql).toContain('-- Tables (6):')
    expect(setupSql).toContain('--   - agent_threads: Agent 会话线程')
    expect(setupSql).toContain('CREATE OR REPLACE FUNCTION admin_delete_organization(')
    expect(cookbook).not.toContain('`persons`')
    expect(cookbook).toContain('admin_delete_organization')
    expect(cookbook).toContain('`agent_threads`')
    expect(cookbook).toContain('`agent_actions`')
  })

  it('关键契约文件全部存在', () => {
    const requiredFiles = [
      path.join(DOCS_ROOT, 'Swagger.yml'),
      path.join(DOCS_ROOT, 'OPENAPI-LIST.md'),
      path.join(DOCS_ROOT, 'crawfish-template.schema.json'),
      path.join(APP_ROOT, '.env.example'),
    ]

    for (const filePath of requiredFiles) {
      expect(fs.existsSync(filePath), `${filePath} should exist`).toBe(true)
    }
  })
})
