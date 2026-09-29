import { ForbiddenException, Injectable } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  Permission,
  workspaceRolePermissions,
} from './workspace-permission.js';

@Injectable()
export class WorkspacePermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async assertPermission(
    workspaceId: string,
    userId: string,
    permission: Permission,
  ) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { role: true },
    });
    if (!member) {
      throw new ForbiddenException('You are not a workspace member');
    }
    if (!workspaceRolePermissions[member.role].includes(permission)) {
      throw new ForbiddenException('You do not have permission for this operation');
    }
    return member;
  }

  async assertAnyPermission(
    workspaceId: string,
    userId: string,
    permissions: readonly Permission[],
  ) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { role: true },
    });
    if (!member) {
      throw new ForbiddenException('You are not a workspace member');
    }
    if (
      !permissions.some((permission) =>
        workspaceRolePermissions[member.role].includes(permission),
      )
    ) {
      throw new ForbiddenException('You do not have permission for this operation');
    }
    return member;
  }

  permissionsForRole(role: WorkspaceRole) {
    return workspaceRolePermissions[role];
  }
}
