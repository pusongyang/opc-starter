import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createNetworkManager } from '../networkManager'

describe('NetworkManager', () => {
  let manager: ReturnType<typeof createNetworkManager>
  let originalOnLine: boolean

  beforeEach(() => {
    originalOnLine = navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true })
    manager = createNetworkManager()
  })

  afterEach(() => {
    manager.cleanup()
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
      configurable: true,
    })
  })

  describe('isOnline', () => {
    it('reflects initial navigator.onLine value', () => {
      expect(manager.isOnline()).toBe(true)
    })

    it('reflects false when navigator is offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true,
      })
      const offlineManager = createNetworkManager()
      expect(offlineManager.isOnline()).toBe(false)
    })
  })

  describe('setOnline', () => {
    it('updates online state', () => {
      manager.setOnline(false)
      expect(manager.isOnline()).toBe(false)

      manager.setOnline(true)
      expect(manager.isOnline()).toBe(true)
    })
  })

  describe('setup', () => {
    it('calls onOnline when online event fires', () => {
      const callbacks = { onOnline: vi.fn(), onOffline: vi.fn() }
      manager.setup(callbacks)

      window.dispatchEvent(new Event('online'))
      expect(callbacks.onOnline).toHaveBeenCalledOnce()
      expect(manager.isOnline()).toBe(true)
    })

    it('calls onOffline when offline event fires', () => {
      const callbacks = { onOnline: vi.fn(), onOffline: vi.fn() }
      manager.setup(callbacks)

      window.dispatchEvent(new Event('offline'))
      expect(callbacks.onOffline).toHaveBeenCalledOnce()
      expect(manager.isOnline()).toBe(false)
    })

    it('dispatches custom network event on online', () => {
      const callbacks = { onOnline: vi.fn(), onOffline: vi.fn() }
      manager.setup(callbacks)

      const listener = vi.fn()
      window.addEventListener('dataservice:network', listener)

      window.dispatchEvent(new Event('online'))
      expect(listener).toHaveBeenCalledOnce()

      window.removeEventListener('dataservice:network', listener)
    })

    it('dispatches custom network event on offline', () => {
      const callbacks = { onOnline: vi.fn(), onOffline: vi.fn() }
      manager.setup(callbacks)

      const listener = vi.fn()
      window.addEventListener('dataservice:network', listener)

      window.dispatchEvent(new Event('offline'))
      expect(listener).toHaveBeenCalledOnce()

      window.removeEventListener('dataservice:network', listener)
    })
  })

  describe('cleanup', () => {
    it('removes event listeners', () => {
      const callbacks = { onOnline: vi.fn(), onOffline: vi.fn() }
      manager.setup(callbacks)
      manager.cleanup()

      window.dispatchEvent(new Event('online'))
      window.dispatchEvent(new Event('offline'))

      expect(callbacks.onOnline).not.toHaveBeenCalled()
      expect(callbacks.onOffline).not.toHaveBeenCalled()
    })
  })
})
