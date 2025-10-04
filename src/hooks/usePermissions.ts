import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionResource, PermissionAction, UserPermission } from '@/types/permissions';

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    loadPermissions();
  }, [user]);

  const loadPermissions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_permissions', {
        _user_id: user.id
      });

      if (error) throw error;
      setPermissions((data as UserPermission[]) || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (resource: PermissionResource, action: PermissionAction): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    const superAdminPerm = permissions.find(p => p.source === 'super_admin');
    if (superAdminPerm) return true;

    // Check if user has the specific permission
    return permissions.some(
      p => p.resource === resource && 
           p.action === action && 
           p.source !== 'user_revoked'
    );
  };

  const hasAnyPermission = (resource: PermissionResource, actions: PermissionAction[]): boolean => {
    return actions.some(action => hasPermission(resource, action));
  };

  const hasAllPermissions = (resource: PermissionResource, actions: PermissionAction[]): boolean => {
    return actions.every(action => hasPermission(resource, action));
  };

  const canCreate = (resource: PermissionResource) => hasPermission(resource, 'create');
  const canRead = (resource: PermissionResource) => hasPermission(resource, 'read');
  const canUpdate = (resource: PermissionResource) => hasPermission(resource, 'update');
  const canDelete = (resource: PermissionResource) => hasPermission(resource, 'delete');
  const canExport = (resource: PermissionResource) => hasPermission(resource, 'export');

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canExport,
    refresh: loadPermissions
  };
}
