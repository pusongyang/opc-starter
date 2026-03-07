import { describe, it, expect, beforeEach, vi } from 'vitest'

const { mockProfileService } = vi.hoisted(() => ({
  mockProfileService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
  },
}))

vi.mock('@/services/api/profileService', () => ({
  profileService: mockProfileService,
}))

import { useProfileStore } from '../useProfileStore'

const mockProfile = {
  id: 'user-1',
  fullName: 'Test User',
  email: 'test@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  updatedAt: new Date(),
}

describe('useProfileStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useProfileStore.getState().reset()
  })

  describe('initial state', () => {
    it('starts with null profile and no loading', () => {
      const state = useProfileStore.getState()
      expect(state.profile).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.isEditing).toBe(false)
      expect(state.error).toBeNull()
      expect(state.uploadProgress).toBe(0)
    })
  })

  describe('loadProfile', () => {
    it('loads profile successfully', async () => {
      mockProfileService.getProfile.mockResolvedValue(mockProfile)

      await useProfileStore.getState().loadProfile()

      const state = useProfileStore.getState()
      expect(state.profile).toEqual(mockProfile)
      expect(state.isLoading).toBe(false)
    })

    it('sets error on failure', async () => {
      mockProfileService.getProfile.mockRejectedValue(new Error('Network error'))

      await useProfileStore.getState().loadProfile()

      const state = useProfileStore.getState()
      expect(state.error).toBe('Network error')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('updateProfile', () => {
    it('does optimistic update then confirms with server', async () => {
      useProfileStore.setState({ profile: mockProfile as never })
      const updatedProfile = { ...mockProfile, fullName: 'Updated Name' }
      mockProfileService.updateProfile.mockResolvedValue(updatedProfile)

      await useProfileStore.getState().updateProfile({ fullName: 'Updated Name' })

      expect(useProfileStore.getState().profile?.fullName).toBe('Updated Name')
      expect(useProfileStore.getState().isEditing).toBe(false)
    })

    it('rolls back on failure', async () => {
      useProfileStore.setState({ profile: mockProfile as never })
      mockProfileService.updateProfile.mockRejectedValue(new Error('Update failed'))

      await expect(useProfileStore.getState().updateProfile({ fullName: 'New' })).rejects.toThrow()

      expect(useProfileStore.getState().profile?.fullName).toBe('Test User')
      expect(useProfileStore.getState().error).toBe('Update failed')
    })

    it('sets error when no profile loaded', async () => {
      await useProfileStore.getState().updateProfile({ fullName: 'New' })
      expect(useProfileStore.getState().error).toBe('请先加载个人信息')
    })
  })

  describe('deleteAvatar', () => {
    it('clears avatar URL on success', async () => {
      useProfileStore.setState({ profile: mockProfile as never })
      mockProfileService.deleteAvatar.mockResolvedValue(undefined)

      await useProfileStore.getState().deleteAvatar()

      expect(useProfileStore.getState().profile?.avatarUrl).toBeUndefined()
    })

    it('sets error when no profile', async () => {
      await useProfileStore.getState().deleteAvatar()
      expect(useProfileStore.getState().error).toBe('请先加载个人信息')
    })
  })

  describe('setEditing', () => {
    it('toggles editing state and clears error', () => {
      useProfileStore.setState({ error: 'old error' })
      useProfileStore.getState().setEditing(true)
      expect(useProfileStore.getState().isEditing).toBe(true)
      expect(useProfileStore.getState().error).toBeNull()
    })
  })

  describe('clearError', () => {
    it('clears error', () => {
      useProfileStore.setState({ error: 'some error' })
      useProfileStore.getState().clearError()
      expect(useProfileStore.getState().error).toBeNull()
    })
  })

  describe('reset', () => {
    it('resets all state to initial values', () => {
      useProfileStore.setState({
        profile: mockProfile as never,
        isLoading: true,
        isEditing: true,
        error: 'error',
        uploadProgress: 50,
      })
      useProfileStore.getState().reset()
      const state = useProfileStore.getState()
      expect(state.profile).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.uploadProgress).toBe(0)
    })
  })
})
