import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({ supabase: {} }))

describe('MemoryCache', () => {
  let memoryCache: Awaited<typeof import('../../cache/memoryCache')>['memoryCache']

  beforeEach(async () => {
    vi.resetModules()
    vi.useFakeTimers()
    const mod = await import('../../cache/memoryCache')
    memoryCache = mod.memoryCache
    memoryCache.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('get/set', () => {
    it('returns null for missing key', () => {
      expect(memoryCache.get('nonexistent')).toBeNull()
    })

    it('stores and retrieves data', () => {
      memoryCache.set('key1', { value: 42 })
      expect(memoryCache.get<{ value: number }>('key1')).toEqual({ value: 42 })
    })

    it('returns null for expired entries', () => {
      memoryCache.set('key1', 'data', 1000)
      vi.advanceTimersByTime(1001)
      expect(memoryCache.get('key1')).toBeNull()
    })

    it('returns data before TTL expires', () => {
      memoryCache.set('key1', 'data', 5000)
      vi.advanceTimersByTime(4999)
      expect(memoryCache.get('key1')).toBe('data')
    })
  })

  describe('getOrFetch', () => {
    it('returns cached data without calling fetcher', async () => {
      memoryCache.set('key1', 'cached')
      const fetcher = vi.fn().mockResolvedValue('fetched')

      const result = await memoryCache.getOrFetch('key1', fetcher)
      expect(result).toBe('cached')
      expect(fetcher).not.toHaveBeenCalled()
    })

    it('calls fetcher when cache is empty', async () => {
      const fetcher = vi.fn().mockResolvedValue('fetched')

      const result = await memoryCache.getOrFetch('key1', fetcher)
      expect(result).toBe('fetched')
      expect(fetcher).toHaveBeenCalledOnce()
    })

    it('deduplicates concurrent requests', async () => {
      let resolveCount = 0
      const fetcher = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveCount++
            setTimeout(() => resolve(`result-${resolveCount}`), 100)
          })
      )

      const promise1 = memoryCache.getOrFetch('key1', fetcher)
      const promise2 = memoryCache.getOrFetch('key1', fetcher)

      vi.advanceTimersByTime(100)

      const [r1, r2] = await Promise.all([promise1, promise2])
      expect(r1).toBe(r2)
      expect(fetcher).toHaveBeenCalledOnce()
    })

    it('caches fetcher result after resolution', async () => {
      const fetcher = vi.fn().mockResolvedValue('data')

      await memoryCache.getOrFetch('key1', fetcher)
      const cached = memoryCache.get('key1')
      expect(cached).toBe('data')
    })

    it('does not cache on fetcher error', async () => {
      const fetcher = vi.fn().mockRejectedValue(new Error('fail'))

      await expect(memoryCache.getOrFetch('key1', fetcher)).rejects.toThrow('fail')
      expect(memoryCache.get('key1')).toBeNull()
    })
  })

  describe('delete', () => {
    it('removes a specific key', () => {
      memoryCache.set('key1', 'data1')
      memoryCache.set('key2', 'data2')
      memoryCache.delete('key1')
      expect(memoryCache.get('key1')).toBeNull()
      expect(memoryCache.get('key2')).toBe('data2')
    })
  })

  describe('deleteByPrefix', () => {
    it('removes all matching keys', () => {
      memoryCache.set('org:tree', 'tree')
      memoryCache.set('org:detail:1', 'detail1')
      memoryCache.set('profile:abc', 'profile')
      memoryCache.deleteByPrefix('org:')
      expect(memoryCache.get('org:tree')).toBeNull()
      expect(memoryCache.get('org:detail:1')).toBeNull()
      expect(memoryCache.get('profile:abc')).toBe('profile')
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      memoryCache.set('a', 1)
      memoryCache.set('b', 2)
      memoryCache.clear()
      expect(memoryCache.getStats().size).toBe(0)
    })
  })

  describe('getStats', () => {
    it('returns correct size and keys', () => {
      memoryCache.set('key1', 'data1')
      memoryCache.set('key2', 'data2')
      const stats = memoryCache.getStats()
      expect(stats.size).toBe(2)
      expect(stats.keys).toContain('key1')
      expect(stats.keys).toContain('key2')
    })
  })

  describe('invalidateOrganizations', () => {
    it('removes all org: prefixed keys', () => {
      memoryCache.set('org:tree', 'tree')
      memoryCache.set('org:members:1', 'members')
      memoryCache.set('profile:x', 'profile')
      memoryCache.invalidateOrganizations()
      expect(memoryCache.get('org:tree')).toBeNull()
      expect(memoryCache.get('org:members:1')).toBeNull()
      expect(memoryCache.get('profile:x')).toBe('profile')
    })
  })

  describe('invalidateProfiles', () => {
    it('removes profile: prefixed keys and ALL_USERS', () => {
      memoryCache.set('profile:abc', 'p1')
      memoryCache.set(memoryCache.KEYS.ALL_USERS, 'users')
      memoryCache.set('org:tree', 'tree')
      memoryCache.invalidateProfiles()
      expect(memoryCache.get('profile:abc')).toBeNull()
      expect(memoryCache.get(memoryCache.KEYS.ALL_USERS)).toBeNull()
      expect(memoryCache.get('org:tree')).toBe('tree')
    })
  })

  describe('KEYS constants', () => {
    it('provides expected cache key prefixes', () => {
      expect(memoryCache.KEYS.ORG_TREE).toBe('org:tree')
      expect(memoryCache.KEYS.ORG_DETAIL).toBe('org:detail:')
      expect(memoryCache.KEYS.ORG_MEMBERS).toBe('org:members:')
      expect(memoryCache.KEYS.PROFILE).toBe('profile:')
      expect(memoryCache.KEYS.ALL_USERS).toBe('users:all')
    })
  })
})
