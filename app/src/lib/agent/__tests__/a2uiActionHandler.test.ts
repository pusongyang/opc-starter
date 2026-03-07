import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleA2UIAction } from '../a2uiActionHandler'

describe('A2UIActionHandler', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      ...window,
      location: { href: '' },
    })
  })

  describe('navigation actions', () => {
    const navCases: Array<[string, string]> = [
      ['navigation.dashboard', '/'],
      ['navigation.persons', '/persons'],
      ['navigation.profile', '/profile'],
      ['navigation.settings', '/settings'],
      ['navigation.cloudStorage', '/settings/cloud-storage'],
      ['navigation.timeline', '/'],
      ['navigation.albums', '/'],
    ]

    it.each(navCases)('"%s" navigates to %s', async (actionId, expectedPath) => {
      const result = await handleA2UIAction(actionId, 'comp1')
      expect(result.success).toBe(true)
      expect(window.location.href).toBe(expectedPath)
    })
  })

  describe('removed features', () => {
    const removedActions = [
      'navigation.search',
      'photo.edit.saveAsNew',
      'photo.edit.reset',
      'photo.edit.undo',
      'photo.edit.redo',
      'photo.edit.confirm',
      'navigation.openEditor',
      'navigation.openAIStudio',
    ]

    it.each(removedActions)('"%s" returns error', async (actionId) => {
      const result = await handleA2UIAction(actionId, 'comp1')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('unknown actions', () => {
    it('returns error for unknown action', async () => {
      const result = await handleA2UIAction('unknown.action', 'comp1')
      expect(result.success).toBe(false)
      expect(result.error).toContain('未知操作')
    })
  })
})
