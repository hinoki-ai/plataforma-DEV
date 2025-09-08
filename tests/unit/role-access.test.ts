import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRoleAccess,
  canAccessSection,
  getAccessibleSections,
  canEditRecord,
  canDeleteRecord,
  getAuthorFilter,
  getDefaultRedirectPath,
  getRoleFilter,
  getRoleDisplayName,
} from '@/lib/role-utils';
import { ExtendedUserRole } from '@/lib/authorization';

describe('Role-Based Access Control', () => {
  describe('Route Protection', () => {
    it('should allow admin access to all sections', () => {
      const access = getRoleAccess('ADMIN');

      expect(access.canAccessAdmin).toBe(true);
      expect(access.canAccessProfesor).toBe(true);
      expect(access.canAccessParent).toBe(true);
      expect(access.canAccessPublic).toBe(true);
    });

    it('should allow teacher access to teacher and parent sections', () => {
      const access = getRoleAccess('PROFESOR');

      expect(access.canAccessAdmin).toBe(false);
      expect(access.canAccessProfesor).toBe(true);
      expect(access.canAccessParent).toBe(true);
      expect(access.canAccessPublic).toBe(true);
    });

    it('should allow parent access to parent section only', () => {
      const access = getRoleAccess('PARENT');

      expect(access.canAccessAdmin).toBe(false);
      expect(access.canAccessProfesor).toBe(false);
      expect(access.canAccessParent).toBe(true);
      expect(access.canAccessPublic).toBe(true);
    });

    it('should allow public access to public section only', () => {
      const access = getRoleAccess('PUBLIC');

      expect(access.canAccessAdmin).toBe(false);
      expect(access.canAccessProfesor).toBe(false);
      expect(access.canAccessParent).toBe(false);
      expect(access.canAccessPublic).toBe(true);
    });

    it('should handle undefined role gracefully', () => {
      const access = getRoleAccess(undefined);

      expect(access.canAccessAdmin).toBe(false);
      expect(access.canAccessProfesor).toBe(false);
      expect(access.canAccessParent).toBe(false);
      expect(access.canAccessPublic).toBe(true);
    });
  });

  describe('Section Access Control', () => {
    it('should allow admin to access admin section', () => {
      expect(canAccessSection('ADMIN', 'admin')).toBe(true);
    });

    it('should allow admin to access teacher section', () => {
      expect(canAccessSection('ADMIN', 'profesor')).toBe(true);
    });

    it('should allow admin to access parent section', () => {
      expect(canAccessSection('ADMIN', 'parent')).toBe(true);
    });

    it('should allow teacher to access teacher section', () => {
      expect(canAccessSection('PROFESOR', 'profesor')).toBe(true);
    });

    it('should deny teacher access to admin section', () => {
      expect(canAccessSection('PROFESOR', 'admin')).toBe(false);
    });

    it('should allow teacher to access parent section', () => {
      expect(canAccessSection('PROFESOR', 'parent')).toBe(true);
    });

    it('should deny parent access to admin section', () => {
      expect(canAccessSection('PARENT', 'admin')).toBe(false);
    });

    it('should deny parent access to teacher section', () => {
      expect(canAccessSection('PARENT', 'profesor')).toBe(false);
    });

    it('should allow parent to access parent section', () => {
      expect(canAccessSection('PARENT', 'parent')).toBe(true);
    });

    it('should allow all roles to access public section', () => {
      const roles: ExtendedUserRole[] = [
        'ADMIN',
        'PROFESOR',
        'PARENT',
        'PUBLIC',
      ];

      roles.forEach(role => {
        expect(canAccessSection(role, 'public')).toBe(true);
      });
    });
  });

  describe('Accessible Sections', () => {
    it('should return all sections for admin', () => {
      const sections = getAccessibleSections('ADMIN');
      expect(sections).toContain('admin');
      expect(sections).toContain('profesor');
      expect(sections).toContain('parent');
      expect(sections).toContain('public');
    });

    it('should return teacher and parent sections for teacher', () => {
      const sections = getAccessibleSections('PROFESOR');
      expect(sections).not.toContain('admin');
      expect(sections).toContain('profesor');
      expect(sections).toContain('parent');
      expect(sections).toContain('public');
    });

    it('should return only parent and public sections for parent', () => {
      const sections = getAccessibleSections('PARENT');
      expect(sections).not.toContain('admin');
      expect(sections).not.toContain('profesor');
      expect(sections).toContain('parent');
      expect(sections).toContain('public');
    });

    it('should return only public section for public user', () => {
      const sections = getAccessibleSections('PUBLIC');
      expect(sections).not.toContain('admin');
      expect(sections).not.toContain('profesor');
      expect(sections).not.toContain('parent');
      expect(sections).toContain('public');
    });
  });

  describe('Record Ownership Control', () => {
    const adminId = 'admin-123';
    const teacherId = 'teacher-123';
    const parentId = 'parent-123';
    const otherTeacherId = 'other-teacher-456';

    it('should allow admin to edit any record', () => {
      expect(canEditRecord('ADMIN', teacherId, adminId)).toBe(true);
      expect(canEditRecord('ADMIN', parentId, adminId)).toBe(true);
      expect(canEditRecord('ADMIN', otherTeacherId, adminId)).toBe(true);
    });

    it('should allow teacher to edit their own records', () => {
      expect(canEditRecord('PROFESOR', teacherId, teacherId)).toBe(true);
    });

    it('should deny teacher access to other teacher records', () => {
      expect(canEditRecord('PROFESOR', otherTeacherId, teacherId)).toBe(false);
    });

    it('should deny parent access to edit records', () => {
      expect(canEditRecord('PARENT', parentId, parentId)).toBe(false);
    });

    it('should deny public user access to edit records', () => {
      expect(canEditRecord('PUBLIC', parentId, parentId)).toBe(false);
    });
  });

  describe('Record Deletion Control', () => {
    const adminId = 'admin-123';
    const teacherId = 'teacher-123';
    const otherTeacherId = 'other-teacher-456';

    it('should allow admin to delete any record', () => {
      expect(canDeleteRecord('ADMIN', teacherId, adminId)).toBe(true);
      expect(canDeleteRecord('ADMIN', otherTeacherId, adminId)).toBe(true);
    });

    it('should allow teacher to delete their own records', () => {
      expect(canDeleteRecord('PROFESOR', teacherId, teacherId)).toBe(true);
    });

    it('should deny teacher access to delete other teacher records', () => {
      expect(canDeleteRecord('PROFESOR', otherTeacherId, teacherId)).toBe(
        false
      );
    });

    it('should deny parent access to delete records', () => {
      expect(canDeleteRecord('PARENT', 'parent-123', 'parent-123')).toBe(false);
    });
  });

  describe('Author Filter Generation', () => {
    const adminId = 'admin-123';
    const teacherId = 'teacher-123';
    const parentId = 'parent-123';

    it('should return empty filter for admin', () => {
      const filter = getAuthorFilter('ADMIN', adminId);
      expect(filter).toEqual({});
    });

    it('should return ownership filter for teacher', () => {
      const filter = getAuthorFilter('PROFESOR', teacherId);
      expect(filter).toEqual({
        OR: [{ createdBy: teacherId }, { isPublic: true }],
      });
    });

    it('should return public filter for parent', () => {
      const filter = getAuthorFilter('PARENT', parentId);
      expect(filter).toEqual({
        isPublic: true,
      });
    });

    it('should return public filter for public user', () => {
      const filter = getAuthorFilter('PUBLIC', 'public-123');
      expect(filter).toEqual({
        isPublic: true,
      });
    });
  });

  describe('Default Redirect Paths', () => {
    it('should redirect admin to admin dashboard', () => {
      expect(getDefaultRedirectPath('ADMIN')).toBe('/admin');
    });

    it('should redirect teacher to teacher dashboard', () => {
      expect(getDefaultRedirectPath('PROFESOR')).toBe('/profesor');
    });

    it('should redirect parent to parent dashboard', () => {
      expect(getDefaultRedirectPath('PARENT')).toBe('/parent');
    });

    it('should redirect public user to home', () => {
      expect(getDefaultRedirectPath('PUBLIC')).toBe('/');
    });

    it('should redirect unknown role to home', () => {
      expect(getDefaultRedirectPath('UNKNOWN' as ExtendedUserRole)).toBe('/');
    });
  });

  describe('Role Filter Generation', () => {
    it('should return empty filter for admin', () => {
      const filter = getRoleFilter('ADMIN');
      expect(filter).toEqual({});
    });

    it('should return empty filter for teacher', () => {
      const filter = getRoleFilter('PROFESOR');
      expect(filter).toEqual({});
    });

    it('should return empty filter for parent', () => {
      const filter = getRoleFilter('PARENT');
      expect(filter).toEqual({});
    });

    it('should return empty filter for public user', () => {
      const filter = getRoleFilter('PUBLIC');
      expect(filter).toEqual({});
    });

    it('should return empty filter for undefined role', () => {
      const filter = getRoleFilter(undefined);
      expect(filter).toEqual({});
    });
  });

  describe('Role Display Names', () => {
    it('should return correct display name for admin', () => {
      expect(getRoleDisplayName('ADMIN')).toBe('Administrador');
    });

    it('should return correct display name for teacher', () => {
      expect(getRoleDisplayName('PROFESOR')).toBe('Profesor');
    });

    it('should return correct display name for parent', () => {
      expect(getRoleDisplayName('PARENT')).toBe('Padre/Apoderado');
    });

    it('should return correct display name for public user', () => {
      expect(getRoleDisplayName('PUBLIC')).toBe('Público');
    });

    it('should return role as string for unknown role', () => {
      expect(getRoleDisplayName('UNKNOWN' as ExtendedUserRole)).toBe('UNKNOWN');
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle null role gracefully', () => {
      const access = getRoleAccess(null as any);
      expect(access.canAccessAdmin).toBe(false);
      expect(access.canAccessPublic).toBe(true);
    });

    it('should handle empty string role gracefully', () => {
      const access = getRoleAccess('');
      expect(access.canAccessAdmin).toBe(false);
      expect(access.canAccessPublic).toBe(true);
    });

    it('should handle invalid section gracefully', () => {
      expect(canAccessSection('ADMIN', 'invalid' as any)).toBe(false);
    });

    it('should handle empty user IDs gracefully', () => {
      const filter = getAuthorFilter('PROFESOR', '');
      expect(filter).toEqual({
        OR: [{ createdBy: '' }, { isPublic: true }],
      });
    });
  });

  describe('Performance', () => {
    it('should complete role access checks quickly', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        getRoleAccess('ADMIN');
        canAccessSection('PROFESOR', 'profesor');
        getDefaultRedirectPath('PARENT');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete 3000 operations within 50ms
      expect(duration).toBeLessThan(50);
    });
  });
});
