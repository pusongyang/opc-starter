import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  checkPermission,
  getRoleLabel,
  canManageOrganization,
  canManageMembers,
  canEditPhoto,
  canDeletePhoto,
  permissions,
  type UserRole,
} from '../permissions'

describe('permissions', () => {
  describe('hasPermission', () => {
    it('admin has permission for all roles', () => {
      expect(hasPermission('admin', 'admin')).toBe(true)
      expect(hasPermission('admin', 'manager')).toBe(true)
      expect(hasPermission('admin', 'member')).toBe(true)
    })

    it('manager has permission for manager and member', () => {
      expect(hasPermission('manager', 'admin')).toBe(false)
      expect(hasPermission('manager', 'manager')).toBe(true)
      expect(hasPermission('manager', 'member')).toBe(true)
    })

    it('member only has permission for member', () => {
      expect(hasPermission('member', 'admin')).toBe(false)
      expect(hasPermission('member', 'manager')).toBe(false)
      expect(hasPermission('member', 'member')).toBe(true)
    })
  })

  describe('checkPermission', () => {
    it('returns allowed=true when user has sufficient role', () => {
      const result = checkPermission('admin', { minRole: 'member' })
      expect(result.allowed).toBe(true)
      expect(result.message).toBeUndefined()
    })

    it('returns allowed=false with message when insufficient role', () => {
      const result = checkPermission('member', { minRole: 'admin' })
      expect(result.allowed).toBe(false)
      expect(result.message).toContain('管理员')
    })

    it('handles exact role match', () => {
      const result = checkPermission('manager', { minRole: 'manager' })
      expect(result.allowed).toBe(true)
    })
  })

  describe('getRoleLabel', () => {
    it('returns correct Chinese labels', () => {
      expect(getRoleLabel('admin')).toBe('管理员')
      expect(getRoleLabel('manager')).toBe('经理')
      expect(getRoleLabel('member')).toBe('成员')
    })
  })

  describe('canManageOrganization', () => {
    it('only admin can manage organization', () => {
      expect(canManageOrganization('admin')).toBe(true)
      expect(canManageOrganization('manager')).toBe(false)
      expect(canManageOrganization('member')).toBe(false)
    })
  })

  describe('canManageMembers', () => {
    it('only admin can manage members', () => {
      expect(canManageMembers('admin')).toBe(true)
      expect(canManageMembers('manager')).toBe(false)
      expect(canManageMembers('member')).toBe(false)
    })
  })

  describe('canEditPhoto', () => {
    it('owner with member role can edit own photo', () => {
      expect(canEditPhoto('member', true)).toBe(true)
    })

    it('non-owner member cannot edit others photo', () => {
      expect(canEditPhoto('member', false)).toBe(false)
    })

    it('admin can edit any photo', () => {
      expect(canEditPhoto('admin', true)).toBe(true)
      expect(canEditPhoto('admin', false)).toBe(true)
    })

    it('manager cannot edit non-owned photo', () => {
      expect(canEditPhoto('manager', false)).toBe(false)
    })
  })

  describe('canDeletePhoto', () => {
    it('owner with member role can delete own photo', () => {
      expect(canDeletePhoto('member', true)).toBe(true)
    })

    it('non-owner member cannot delete others photo', () => {
      expect(canDeletePhoto('member', false)).toBe(false)
    })

    it('admin can delete any photo', () => {
      expect(canDeletePhoto('admin', true)).toBe(true)
      expect(canDeletePhoto('admin', false)).toBe(true)
    })
  })

  describe('permissions config', () => {
    it('organization permissions require correct roles', () => {
      expect(permissions.organization.create.minRole).toBe('admin')
      expect(permissions.organization.viewAll.minRole).toBe('member')
    })

    it('member permissions all require admin', () => {
      const roles: UserRole[] = ['admin']
      expect(roles).toContain(permissions.member.add.minRole)
      expect(roles).toContain(permissions.member.remove.minRole)
      expect(roles).toContain(permissions.member.changeRole.minRole)
    })

    it('photo upload requires member role', () => {
      expect(permissions.photo.upload.minRole).toBe('member')
      expect(permissions.photo.editOwn.minRole).toBe('member')
      expect(permissions.photo.editAny.minRole).toBe('admin')
    })
  })
})
