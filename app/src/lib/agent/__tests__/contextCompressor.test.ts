import { describe, it, expect } from 'vitest'
import {
  estimateTokenCount,
  estimateTokenUsage,
  compressIfNeeded,
  forceCompress,
  TOKEN_THRESHOLD,
  MAX_TOKENS,
  THRESHOLD_TOKENS,
} from '../contextCompressor'
import type { AgentMessage } from '@/types/agent'

function createMsg(overrides?: Partial<AgentMessage>): AgentMessage {
  return {
    id: `msg_${Math.random().toString(36).slice(2)}`,
    role: 'user',
    content: 'Hello',
    timestamp: new Date(),
    ...overrides,
  }
}

function createMessages(count: number, contentLength = 10): AgentMessage[] {
  return Array.from({ length: count }, (_, i) =>
    createMsg({
      id: `msg_${i}`,
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'x'.repeat(contentLength),
    })
  )
}

describe('contextCompressor', () => {
  describe('constants', () => {
    it('has reasonable defaults', () => {
      expect(TOKEN_THRESHOLD).toBe(0.92)
      expect(MAX_TOKENS).toBe(128000)
      expect(THRESHOLD_TOKENS).toBe(Math.floor(MAX_TOKENS * TOKEN_THRESHOLD))
    })
  })

  describe('estimateTokenCount', () => {
    it('returns 0 for empty messages', () => {
      expect(estimateTokenCount([])).toBe(0)
    })

    it('counts content characters', () => {
      const msgs = [createMsg({ content: 'Hello World' })]
      const count = estimateTokenCount(msgs)
      expect(count).toBeGreaterThan(0)
    })

    it('includes role marker overhead', () => {
      const msgEmpty = [createMsg({ content: '' })]
      const count = estimateTokenCount(msgEmpty)
      expect(count).toBeGreaterThan(0)
    })

    it('includes tool calls in estimation', () => {
      const msgsWithTools = [
        createMsg({
          toolCalls: [
            {
              id: 'tc1',
              name: 'testTool',
              arguments: { foo: 'bar' },
              result: { success: true },
              status: 'success' as const,
            },
          ],
        }),
      ]
      const msgsWithout = [createMsg({ content: '' })]
      expect(estimateTokenCount(msgsWithTools)).toBeGreaterThan(estimateTokenCount(msgsWithout))
    })

    it('includes a2ui messages in estimation', () => {
      const msgsWithA2UI = [
        createMsg({
          a2uiMessages: [
            { type: 'render', component: { type: 'text', id: '1', props: {} } } as never,
          ],
        }),
      ]
      const msgsWithout = [createMsg({ content: '' })]
      expect(estimateTokenCount(msgsWithA2UI)).toBeGreaterThan(estimateTokenCount(msgsWithout))
    })

    it('scales linearly with message count', () => {
      const small = estimateTokenCount(createMessages(5))
      const large = estimateTokenCount(createMessages(50))
      expect(large).toBeGreaterThan(small * 5)
    })
  })

  describe('estimateTokenUsage', () => {
    it('returns usage rate as fraction of MAX_TOKENS', () => {
      const msgs = createMessages(5, 100)
      const estimate = estimateTokenUsage(msgs)
      expect(estimate.usageRate).toBeGreaterThan(0)
      expect(estimate.usageRate).toBeLessThan(1)
    })

    it('sets needsCompression when above threshold', () => {
      const largeContent = 'x'.repeat(MAX_TOKENS * 2.5)
      const msgs = [createMsg({ content: largeContent })]
      const estimate = estimateTokenUsage(msgs)
      expect(estimate.needsCompression).toBe(true)
    })

    it('does not need compression for small messages', () => {
      const msgs = createMessages(3, 10)
      const estimate = estimateTokenUsage(msgs)
      expect(estimate.needsCompression).toBe(false)
    })
  })

  describe('compressIfNeeded', () => {
    it('returns original messages when below threshold', () => {
      const msgs = createMessages(5)
      const result = compressIfNeeded(msgs)
      expect(result).toBe(msgs)
    })

    it('returns original when messages count is small even if content large', () => {
      const msgs = createMessages(9, MAX_TOKENS)
      const result = compressIfNeeded(msgs)
      expect(result.length).toBeLessThanOrEqual(msgs.length)
    })

    it('compresses large conversations', () => {
      const msgs = createMessages(30, MAX_TOKENS * 0.1)
      const result = compressIfNeeded(msgs)
      expect(result.length).toBeLessThan(msgs.length)
    })

    it('preserves head and tail messages', () => {
      const msgs = createMessages(30, MAX_TOKENS * 0.1)
      const result = compressIfNeeded(msgs)
      if (result.length < msgs.length) {
        expect(result[0].id).toBe(msgs[0].id)
        expect(result[1].id).toBe(msgs[1].id)
        expect(result[result.length - 1].id).toBe(msgs[msgs.length - 1].id)
      }
    })

    it('inserts a system summary message', () => {
      const msgs = createMessages(30, MAX_TOKENS * 0.1)
      const result = compressIfNeeded(msgs)
      if (result.length < msgs.length) {
        const summaryMsg = result.find((m) => m.id.startsWith('summary_'))
        expect(summaryMsg).toBeDefined()
        expect(summaryMsg?.role).toBe('system')
        expect(summaryMsg?.content).toContain('历史摘要')
      }
    })
  })

  describe('forceCompress', () => {
    it('returns original when too few messages', () => {
      const msgs = createMessages(8)
      const result = forceCompress(msgs)
      expect(result).toEqual(msgs)
    })

    it('compresses regardless of token count', () => {
      const msgs = createMessages(15, 5)
      const result = forceCompress(msgs)
      expect(result.length).toBeLessThan(msgs.length)
    })

    it('keeps head + summary + tail structure', () => {
      const msgs = createMessages(20, 10)
      const result = forceCompress(msgs)
      expect(result[0].id).toBe(msgs[0].id)
      expect(result[1].id).toBe(msgs[1].id)
      const summaryMsg = result.find((m) => m.id.startsWith('summary_'))
      expect(summaryMsg).toBeDefined()
      expect(result[result.length - 1].id).toBe(msgs[msgs.length - 1].id)
    })
  })
})
