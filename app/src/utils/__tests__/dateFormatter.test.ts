import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { formatDate, formatDateTime, formatRelativeTime, getDateLabel } from '../dateFormatter'

describe('dateFormatter', () => {
  describe('formatDate', () => {
    it('formats a Date object to Chinese date', () => {
      const result = formatDate(new Date(2024, 0, 15))
      expect(result).toBe('2024年1月15日')
    })

    it('formats a date string', () => {
      const result = formatDate('2024-06-20')
      expect(result).toContain('2024年6月20日')
    })

    it('returns fallback for invalid date', () => {
      expect(formatDate('invalid')).toBe('日期未知')
    })
  })

  describe('formatDateTime', () => {
    it('formats date with time', () => {
      const result = formatDateTime(new Date(2024, 0, 15, 14, 30))
      expect(result).toBe('2024年1月15日 14:30')
    })

    it('returns fallback for invalid date', () => {
      expect(formatDateTime('not-a-date')).toBe('日期未知')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2024, 5, 15, 12, 0, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns "刚刚" for recent times', () => {
      const date = new Date(2024, 5, 15, 11, 59, 30)
      expect(formatRelativeTime(date)).toBe('刚刚')
    })

    it('returns minutes ago', () => {
      const date = new Date(2024, 5, 15, 11, 45, 0)
      expect(formatRelativeTime(date)).toBe('15分钟前')
    })

    it('returns hours ago', () => {
      const date = new Date(2024, 5, 15, 9, 0, 0)
      expect(formatRelativeTime(date)).toBe('3小时前')
    })

    it('returns days ago', () => {
      const date = new Date(2024, 5, 12, 12, 0, 0)
      expect(formatRelativeTime(date)).toBe('3天前')
    })

    it('returns formatted date for old dates', () => {
      const date = new Date(2024, 3, 1)
      const result = formatRelativeTime(date)
      expect(result).toContain('2024年4月1日')
    })

    it('returns fallback for invalid date', () => {
      expect(formatRelativeTime('invalid')).toBe('日期未知')
    })
  })

  describe('getDateLabel', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2024, 5, 15, 12, 0, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns "今天" for today', () => {
      expect(getDateLabel(new Date(2024, 5, 15, 8, 0))).toBe('今天')
    })

    it('returns "昨天" for yesterday', () => {
      expect(getDateLabel(new Date(2024, 5, 14, 20, 0))).toBe('昨天')
    })

    it('returns formatted date for older dates', () => {
      const result = getDateLabel(new Date(2024, 5, 10))
      expect(result).toContain('2024年6月10日')
    })

    it('returns fallback for invalid date', () => {
      expect(getDateLabel('garbage')).toBe('日期未知')
    })
  })
})
