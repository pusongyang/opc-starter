import { describe, it, expect } from 'vitest'
import { createSuccessResult, createErrorResult, createUIResult } from '../helpers'

describe('Agent Tool Helpers', () => {
  describe('createSuccessResult', () => {
    it('creates a success result with message', () => {
      const result = createSuccessResult('Operation completed')
      expect(result).toEqual({
        success: true,
        message: 'Operation completed',
        data: undefined,
      })
    })

    it('includes optional data', () => {
      const result = createSuccessResult('Done', { count: 5 })
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ count: 5 })
    })
  })

  describe('createErrorResult', () => {
    it('creates a failure result with error message', () => {
      const result = createErrorResult('Something went wrong')
      expect(result).toEqual({
        success: false,
        error: 'Something went wrong',
      })
    })
  })

  describe('createUIResult', () => {
    it('creates a success result with UI component', () => {
      const result = createUIResult('Here is a form', {
        id: 'form-1',
        type: 'form',
        props: { title: 'Test' },
      })
      expect(result.success).toBe(true)
      expect(result.message).toBe('Here is a form')
      expect(result.ui).toEqual({
        id: 'form-1',
        type: 'form',
        props: { title: 'Test' },
      })
    })

    it('works without props', () => {
      const result = createUIResult('Card', { id: 'c1', type: 'card' })
      expect(result.ui?.props).toBeUndefined()
    })
  })
})
