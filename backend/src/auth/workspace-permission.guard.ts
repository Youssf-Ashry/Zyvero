import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AuthUser } from './auth.types.js';
import {
  REQUIRED_PERMISSIONS,
  Permission,
} from './workspace-permission.js';
import { WorkspacePermissionService } from './workspace-permission.service.js';

@Injectable()
export class WorkspacePermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissions: WorkspacePermissionService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<Permission[]>(
      REQUIRED_PERMISSIONS,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest<
      Request & { user?: AuthUser }
    >();
    const user = request.user;
    const workspaceParam = request.params.workspaceId;
    const workspaceId = Array.isArray(workspaceParam)
      ? workspaceParam[0]
      : workspaceParam;
    if (!user || !workspaceId) {
      throw new ForbiddenException('Workspace authorization required');
    }
    await this.permissions.assertAnyPermission(workspaceId, user.id, required);
    return true;
  }
}
