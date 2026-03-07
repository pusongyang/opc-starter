import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createOfflineQueueManager } from '../offlineQueueManager'
import type { WriteOperation } from '@/services/data/DataService'

const mockStorage: Record<string, string> = {}

vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key]
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k])
  }),
})

function createMockDeps(overrides?: Partial<Parameters<typeof createOfflineQueueManager>[0]>) {
  return {
    storageKey: 'test-queue',
    isOnline: vi.fn(() => true),
    executeOperation: vi.fn(async () => {}),
    markAsSynced: vi.fn(async () => {}),
    markAsFailed: vi.fn(async () => {}),
    onQueueEmpty: vi.fn(),
    ...overrides,
  }
}

function createOp(overrides?: Partial<WriteOperation>): WriteOperation {
  return {
    type: 'upsert',
    entityType: 'person',
    id: 'test-1',
    data: { name: 'Test' },
    timestamp: Date.now(),
    retryCount: 0,
    ...overrides,
  }
}

describe('OfflineQueueManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k])
  })

  describe('loadQueue', () => {
    it('loads operations from localStorage', () => {
      const ops = [createOp()]
      mockStorage['test-queue'] = JSON.stringify(ops)

      const deps = createMockDeps()
      const manager = createOfflineQueueManager(deps)
      manager.loadQueue()

      expect(manager.getQueue()).toHaveLength(1)
    })

    it('handles empty localStorage gracefully', () => {
      const deps = createMockDeps()
      const manager = createOfflineQueueManager(deps)
      manager.loadQueue()
      expect(manager.getQueue()).toHaveLength(0)
    })

    it('handles corrupt data gracefully', () => {
      mockStorage['test-queue'] = 'invalid-json'
      const deps = createMockDeps()
      const manager = createOfflineQueueManager(deps)
      manager.loadQueue()
      expect(manager.getQueue()).toHaveLength(0)
    })
  })

  describe('enqueueOperation', () => {
    it('adds operation to queue with timestamp and retryCount', async () => {
      const deps = createMockDeps()
      const manager = createOfflineQueueManager(deps)

      await manager.enqueueOperation({ type: 'upsert', entityType: 'person', id: '1', data: {} })

      const queue = manager.getQueue()
      expect(queue).toHaveLength(1)
      expect(queue[0].timestamp).toBeGreaterThan(0)
      expect(queue[0].retryCount).toBe(0)
    })

    it('persists queue to localStorage', async () => {
      const deps = createMockDeps()
      const manager = createOfflineQueueManager(deps)

      await manager.enqueueOperation({ type: 'upsert', entityType: 'person', id: '1', data: {} })

      expect(localStorage.setItem).toHaveBeenCalledWith('test-queue', expect.any(String))
    })
  })

  describe('processOfflineQueue', () => {
    it('processes all operations successfully', async () => {
      const deps = createMockDeps()
      const manager = createOfflineQueueManager(deps)

      manager.setQueue([createOp({ id: '1' }), createOp({ id: '2' })])

      const result = await manager.processOfflineQueue()
      expect(result.success).toBe(2)
      expect(result.failed).toBe(0)
      expect(deps.executeOperation).toHaveBeenCalledTimes(2)
      expect(deps.markAsSynced).toHaveBeenCalledTimes(2)
    })

    it('returns zeros for empty queue', async () => {
      const deps = createMockDeps()
      const manager = createOfflineQueueManager(deps)
      const result = await manager.processOfflineQueue()
      expect(result).toEqual({ success: 0, failed: 0 })
    })

    it('retries failed operations up to 3 times then marks as failed', async () => {
      const deps = createMockDeps({
        executeOperation: vi.fn().mockRejectedValue(new Error('network')),
      })
      const manager = createOfflineQueueManager(deps)
      const op = createOp({ retryCount: 2 })
      manager.setQueue([op])

      const result = await manager.processOfflineQueue()
      expect(result.failed).toBe(1)
      expect(deps.markAsFailed).toHaveBeenCalledOnce()
    })

    it('stops processing on retriable failure', async () => {
      const deps = createMockDeps({
        executeOperation: vi.fn().mockRejectedValue(new Error('temp error')),
      })
      const manager = createOfflineQueueManager(deps)
      manager.setQueue([createOp({ retryCount: 0 })])

      const result = await manager.processOfflineQueue()
      expect(result.success).toBe(0)
      expect(result.failed).toBe(0)
      expect(manager.getQueue()).toHaveLength(1)
    })
  })

  describe('getQueueStats', () => {
    it('returns current queue size and operations', () => {
      const deps = createMockDeps()
      const manager = createOfflineQueueManager(deps)
      const ops = [createOp({ id: '1' }), createOp({ id: '2' })]
      manager.setQueue(ops)

      const stats = manager.getQueueStats()
      expect(stats.queueSize).toBe(2)
      expect(stats.operations).toHaveLength(2)
    })

    it('returns a copy of operations', () => {
      const deps = createMockDeps()
      const manager = createOfflineQueueManager(deps)
      manager.setQueue([createOp()])

      const stats = manager.getQueueStats()
      stats.operations.pop()
      expect(manager.getQueue()).toHaveLength(1)
    })
  })

  describe('setQueue', () => {
    it('replaces queue and persists', () => {
      const deps = createMockDeps()
      const manager = createOfflineQueueManager(deps)
      const ops = [createOp({ id: 'a' })]
      manager.setQueue(ops)

      expect(manager.getQueue()).toHaveLength(1)
      expect(localStorage.setItem).toHaveBeenCalled()
    })
  })
})
