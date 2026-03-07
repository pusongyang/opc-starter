import { describe, it, expect } from 'vitest'
import {
  profileSchema,
  validateAvatarFile,
  validateImageDimensions,
  avatarValidation,
} from '../validation'

describe('validation', () => {
  describe('profileSchema', () => {
    it('validates a complete valid profile', () => {
      const result = profileSchema.safeParse({
        fullName: '张三',
        nickname: '小张',
        gender: 'male',
        team: 'Engineering',
        bio: '一个开发者',
      })
      expect(result.success).toBe(true)
    })

    it('requires fullName with min length 2', () => {
      const result = profileSchema.safeParse({ fullName: 'A' })
      expect(result.success).toBe(false)
    })

    it('rejects fullName exceeding 50 chars', () => {
      const result = profileSchema.safeParse({ fullName: 'A'.repeat(51) })
      expect(result.success).toBe(false)
    })

    it('allows empty optional fields', () => {
      const result = profileSchema.safeParse({
        fullName: '张三',
        nickname: '',
        team: '',
        bio: '',
      })
      expect(result.success).toBe(true)
    })

    it('validates gender enum', () => {
      expect(profileSchema.safeParse({ fullName: '张三', gender: 'male' }).success).toBe(true)
      expect(profileSchema.safeParse({ fullName: '张三', gender: 'female' }).success).toBe(true)
      expect(profileSchema.safeParse({ fullName: '张三', gender: 'other' }).success).toBe(true)
      expect(profileSchema.safeParse({ fullName: '张三', gender: 'invalid' }).success).toBe(false)
    })

    it('rejects bio exceeding 200 chars', () => {
      const result = profileSchema.safeParse({
        fullName: '张三',
        bio: 'x'.repeat(201),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('validateAvatarFile', () => {
    it('accepts valid JPEG file', () => {
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 1024 * 1024 })
      expect(validateAvatarFile(file).valid).toBe(true)
    })

    it('accepts valid PNG file', () => {
      const file = new File(['data'], 'photo.png', { type: 'image/png' })
      Object.defineProperty(file, 'size', { value: 1024 * 1024 })
      expect(validateAvatarFile(file).valid).toBe(true)
    })

    it('accepts valid WebP file', () => {
      const file = new File(['data'], 'photo.webp', { type: 'image/webp' })
      Object.defineProperty(file, 'size', { value: 1024 * 1024 })
      expect(validateAvatarFile(file).valid).toBe(true)
    })

    it('rejects unsupported file types', () => {
      const file = new File(['data'], 'photo.gif', { type: 'image/gif' })
      const result = validateAvatarFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('JPG')
    })

    it('rejects files exceeding max size', () => {
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 })
      const result = validateAvatarFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('5MB')
    })
  })

  describe('validateImageDimensions', () => {
    it('accepts images meeting minimum dimensions', () => {
      const result = validateImageDimensions(200, 200)
      expect(result.valid).toBe(true)
    })

    it('accepts large images', () => {
      const result = validateImageDimensions(1920, 1080)
      expect(result.valid).toBe(true)
    })

    it('rejects images below minimum width', () => {
      const result = validateImageDimensions(100, 200)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('200x200')
    })

    it('rejects images below minimum height', () => {
      const result = validateImageDimensions(200, 100)
      expect(result.valid).toBe(false)
    })
  })

  describe('avatarValidation constants', () => {
    it('has expected configuration', () => {
      expect(avatarValidation.maxSize).toBe(5 * 1024 * 1024)
      expect(avatarValidation.minDimension).toBe(200)
      expect(avatarValidation.allowedTypes).toContain('image/jpeg')
      expect(avatarValidation.allowedTypes).toContain('image/png')
      expect(avatarValidation.allowedTypes).toContain('image/webp')
    })
  })
})
