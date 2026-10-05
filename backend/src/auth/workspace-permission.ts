import { SetMetadata } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';

export enum Permission {
  PROJECT_VIEW = 'PROJECT_VIEW',
  PROJECT_CREATE = 'PROJECT_CREATE',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  PROJECT_DELETE = 'PROJECT_DELETE',
  PROJECT_ASSIGN = 'PROJECT_ASSIGN',
  TASK_VIEW = 'TASK_VIEW',
  TASK_CREATE = 'TASK_CREATE',
  TASK_UPDATE = 'TASK_UPDATE',
  TASK_DELETE = 'TASK_DELETE',
  TASK_ASSIGN = 'TASK_ASSIGN',
  KNOWLEDGE_VIEW = 'KNOWLEDGE_VIEW',
  KNOWLEDGE_CREATE = 'KNOWLEDGE_CREATE',
  KNOWLEDGE_UPDATE = 'KNOWLEDGE_UPDATE',
  KNOWLEDGE_DELETE = 'KNOWLEDGE_DELETE',
  MEMBER_VIEW = 'MEMBER_VIEW',
  MEMBER_INVITE = 'MEMBER_INVITE',
  MEMBER_UPDATE_ROLE = 'MEMBER_UPDATE_ROLE',
  MEMBER_REMOVE = 'MEMBER_REMOVE',
  WORKSPACE_UPDATE = 'WORKSPACE_UPDATE',
  WORKSPACE_DELETE = 'WORKSPACE_DELETE',
}

const allPermissions = Object.values(Permission);

export const workspaceRolePermissions: Record<WorkspaceRole, readonly Permission[]> = {
  [WorkspaceRole.OWNER]: allPermissions,
  [WorkspaceRole.ADMIN]: allPermissions.filter(
    (permission) => permission !== Permission.WORKSPACE_DELETE,
  ),
  [WorkspaceRole.MEMBER]: [
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.KNOWLEDGE_VIEW,
    Permission.KNOWLEDGE_CREATE,
    Permission.KNOWLEDGE_UPDATE,
    Permission.KNOWLEDGE_DELETE,
    Permission.MEMBER_VIEW,
  ],
};

export const REQUIRED_PERMISSIONS = 'required_permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(REQUIRED_PERMISSIONS, permissions);
