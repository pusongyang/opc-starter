import { describe, it, expect, beforeEach, vi } from 'vitest'

const { mockAuthService } = vi.hoisted(() => ({
  mockAuthService: {
    getCurrentUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
}))

vi.mock('@/lib/supabase/auth', () => ({
  authService: mockAuthService,
}))

vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware')
  return {
    ...actual,
    persist: (fn: unknown) => fn,
  }
})

import { useAuthStore } from '../useAuthStore'

const mockUser = { id: 'user-1', email: 'test@example.com' }

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    })
  })

  describe('initialize', () => {
    it('sets user and isAuthenticated on success', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser)
      mockAuthService.onAuthStateChange.mockImplementation(() => {})

      await useAuthStore.getState().initialize()

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
    })

    it('sets isAuthenticated to false when no user', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(null)
      mockAuthService.onAuthStateChange.mockImplementation(() => {})

      await useAuthStore.getState().initialize()

      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('sets error on failure', async () => {
      mockAuthService.getCurrentUser.mockRejectedValue(new Error('Network error'))

      await useAuthStore.getState().initialize()

      const state = useAuthStore.getState()
      expect(state.error?.message).toBe('初始化认证失败')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('signIn', () => {
    it('sets user on successful login', async () => {
      mockAuthService.signIn.mockResolvedValue({ user: mockUser, error: null })

      await useAuthStore.getState().signIn('test@example.com', 'password')

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
    })

    it('sets error on login failure', async () => {
      mockAuthService.signIn.mockResolvedValue({
        user: null,
        error: { message: 'Invalid credentials', code: 'invalid_grant' },
      })

      await useAuthStore.getState().signIn('bad@example.com', 'wrong')

      const state = useAuthStore.getState()
      expect(state.error?.message).toBe('Invalid credentials')
      expect(state.isAuthenticated).toBe(false)
    })

    it('handles unexpected errors', async () => {
      mockAuthService.signIn.mockRejectedValue(new Error('Network'))

      await useAuthStore.getState().signIn('test@example.com', 'pass')

      expect(useAuthStore.getState().error?.message).toBe('登录过程中发生意外错误')
    })
  })

  describe('signUp', () => {
    it('sets user on successful registration', async () => {
      mockAuthService.signUp.mockResolvedValue({ user: mockUser, error: null })

      await useAuthStore.getState().signUp('new@example.com', 'password', 'Test')

      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('sets error on registration failure', async () => {
      mockAuthService.signUp.mockResolvedValue({
        user: null,
        error: { message: 'Email taken', code: 'user_already_exists' },
      })

      await useAuthStore.getState().signUp('exists@example.com', 'pass')

      expect(useAuthStore.getState().error?.message).toBe('Email taken')
    })
  })

  describe('signOut', () => {
    it('clears user on successful logout', async () => {
      useAuthStore.setState({ user: mockUser as never, isAuthenticated: true })
      mockAuthService.signOut.mockResolvedValue({ error: null })

      await useAuthStore.getState().signOut()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('sets error on logout failure', async () => {
      mockAuthService.signOut.mockResolvedValue({ error: { message: 'Session error' } })

      await useAuthStore.getState().signOut()

      expect(useAuthStore.getState().error?.message).toBe('Session error')
    })
  })

  describe('clearError', () => {
    it('clears current error', () => {
      useAuthStore.setState({ error: { message: 'some error' } })
      useAuthStore.getState().clearError()
      expect(useAuthStore.getState().error).toBeNull()
    })
  })
})
