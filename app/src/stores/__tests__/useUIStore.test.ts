import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '../useUIStore'

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      loading: false,
      uploadProgress: 0,
      modal: { isOpen: false },
      toast: { isVisible: false, message: '', type: 'info', duration: 3000 },
    })
  })

  describe('loading', () => {
    it('showLoading sets loading to true', () => {
      useUIStore.getState().showLoading()
      expect(useUIStore.getState().loading).toBe(true)
    })

    it('hideLoading sets loading to false', () => {
      useUIStore.getState().showLoading()
      useUIStore.getState().hideLoading()
      expect(useUIStore.getState().loading).toBe(false)
    })
  })

  describe('uploadProgress', () => {
    it('setUploadProgress updates progress', () => {
      useUIStore.getState().setUploadProgress(50)
      expect(useUIStore.getState().uploadProgress).toBe(50)
    })

    it('handles 0 and 100', () => {
      useUIStore.getState().setUploadProgress(0)
      expect(useUIStore.getState().uploadProgress).toBe(0)
      useUIStore.getState().setUploadProgress(100)
      expect(useUIStore.getState().uploadProgress).toBe(100)
    })
  })

  describe('modal', () => {
    it('openModal sets isOpen and config', () => {
      useUIStore.getState().openModal({ title: 'Test', content: 'Body' as never })
      const modal = useUIStore.getState().modal
      expect(modal.isOpen).toBe(true)
      expect(modal.title).toBe('Test')
    })

    it('closeModal resets modal', () => {
      useUIStore.getState().openModal({ title: 'Test' })
      useUIStore.getState().closeModal()
      expect(useUIStore.getState().modal.isOpen).toBe(false)
    })
  })

  describe('toast', () => {
    it('showToast sets message and visibility', () => {
      useUIStore.getState().showToast('Success!', 'success', 5000)
      const toast = useUIStore.getState().toast
      expect(toast.isVisible).toBe(true)
      expect(toast.message).toBe('Success!')
      expect(toast.type).toBe('success')
      expect(toast.duration).toBe(5000)
    })

    it('showToast uses defaults', () => {
      useUIStore.getState().showToast('Info')
      const toast = useUIStore.getState().toast
      expect(toast.type).toBe('info')
      expect(toast.duration).toBe(3000)
    })

    it('hideToast hides but preserves message', () => {
      useUIStore.getState().showToast('Error!', 'error')
      useUIStore.getState().hideToast()
      const toast = useUIStore.getState().toast
      expect(toast.isVisible).toBe(false)
      expect(toast.message).toBe('Error!')
    })
  })
})
