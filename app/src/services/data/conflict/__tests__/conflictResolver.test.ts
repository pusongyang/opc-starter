import { describe, it, expect, beforeEach } from 'vitest'
import { createConflictResolver } from '../conflictResolver'

describe('ConflictResolver', () => {
  let resolver: ReturnType<typeof createConflictResolver>

  beforeEach(() => {
    resolver = createConflictResolver()
  })

  describe('resolveConflict', () => {
    it('prefers remote when remote version is higher', async () => {
      const local = { id: '1', name: 'local', version: 1 }
      const remote = { id: '1', name: 'remote', version: 2 }

      const result = await resolver.resolveConflict(local, remote)
      expect(result.name).toBe('remote')
      expect(result.id).toBe('1')
    })

    it('prefers local when local version is higher', async () => {
      const local = { id: '1', name: 'local', version: 3 }
      const remote = { id: '1', name: 'remote', version: 1 }

      const result = await resolver.resolveConflict(local, remote)
      expect(result.name).toBe('local')
    })

    it('merges tags when versions are equal and both have tags', async () => {
      const local = { id: '1', tags: ['a', 'b'], version: 1 }
      const remote = { id: '1', tags: ['b', 'c'], version: 1 }

      const result = await resolver.resolveConflict(local, remote)
      expect(result.tags).toEqual(expect.arrayContaining(['a', 'b', 'c']))
      expect(result.tags).toHaveLength(3)
    })

    it('defaults to remote when versions are equal and no tags', async () => {
      const local = { id: '1', name: 'local', version: 1 }
      const remote = { id: '1', name: 'remote', version: 1 }

      const result = await resolver.resolveConflict(local, remote)
      expect(result.name).toBe('remote')
    })

    it('treats undefined version as 0', async () => {
      const local = { id: '1', name: 'local' }
      const remote = { id: '1', name: 'remote', version: 1 }

      const result = await resolver.resolveConflict(local, remote)
      expect(result.name).toBe('remote')
    })

    it('assigns new version timestamp to resolved result', async () => {
      const local = { id: '1', version: 1 }
      const remote = { id: '1', version: 2 }

      const before = Date.now()
      const result = await resolver.resolveConflict(local, remote)
      expect(result.version).toBeGreaterThanOrEqual(before)
    })
  })

  describe('conflict stats', () => {
    it('starts with zero stats', () => {
      const stats = resolver.getConflictStats()
      expect(stats).toEqual({ total: 0, serverWins: 0, localWins: 0, merged: 0 })
    })

    it('tracks server wins', async () => {
      await resolver.resolveConflict({ id: '1', version: 1 }, { id: '1', version: 2 })
      const stats = resolver.getConflictStats()
      expect(stats.total).toBe(1)
      expect(stats.serverWins).toBe(1)
    })

    it('tracks local wins', async () => {
      await resolver.resolveConflict({ id: '1', version: 3 }, { id: '1', version: 1 })
      const stats = resolver.getConflictStats()
      expect(stats.localWins).toBe(1)
    })

    it('tracks merges', async () => {
      await resolver.resolveConflict(
        { id: '1', tags: ['a'], version: 1 },
        { id: '1', tags: ['b'], version: 1 }
      )
      const stats = resolver.getConflictStats()
      expect(stats.merged).toBe(1)
    })

    it('accumulates stats across multiple conflicts', async () => {
      await resolver.resolveConflict({ id: '1', version: 1 }, { id: '1', version: 2 })
      await resolver.resolveConflict({ id: '2', version: 5 }, { id: '2', version: 1 })
      await resolver.resolveConflict(
        { id: '3', tags: [], version: 1 },
        { id: '3', tags: [], version: 1 }
      )
      const stats = resolver.getConflictStats()
      expect(stats.total).toBe(3)
    })

    it('returns a copy of stats (not a reference)', () => {
      const stats1 = resolver.getConflictStats()
      const stats2 = resolver.getConflictStats()
      expect(stats1).not.toBe(stats2)
      expect(stats1).toEqual(stats2)
    })
  })

  describe('resetConflictStats', () => {
    it('resets all stats to zero', async () => {
      await resolver.resolveConflict({ id: '1', version: 1 }, { id: '1', version: 2 })
      resolver.resetConflictStats()
      const stats = resolver.getConflictStats()
      expect(stats).toEqual({ total: 0, serverWins: 0, localWins: 0, merged: 0 })
    })
  })
})
