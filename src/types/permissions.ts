export type PermissionResource = 
  | 'candidates'
  | 'jobs'
  | 'applications'
  | 'interviews'
  | 'offers'
  | 'team'
  | 'settings'
  | 'analytics'
  | 'email_templates';

export type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'bulk_action'
  | 'publish'
  | 'send'
  | 'invite'
  | 'remove';

export interface Permission {
  id: string;
  resource: PermissionResource;
  action: PermissionAction;
  description: string | null;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role: string;
  permission_id: string;
  created_at: string;
}

export interface UserPermissionOverride {
  id: string;
  user_id: string;
  organization_id: string;
  permission_id: string;
  is_granted: boolean;
  created_at: string;
  updated_at: string;
  granted_by: string | null;
}

export interface UserPermission {
  resource: PermissionResource;
  action: PermissionAction;
  description: string | null;
  source: 'role' | 'user_granted' | 'user_revoked' | 'super_admin';
}
