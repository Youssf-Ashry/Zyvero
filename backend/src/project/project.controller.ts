import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { WorkspacePermissionGuard } from '../auth/workspace-permission.guard.js';
import { Permission, RequirePermissions } from '../auth/workspace-permission.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectService } from './project.service.js';

@Controller('workspaces/:workspaceId/projects')
@UseGuards(AuthGuard, WorkspacePermissionGuard)
export class ProjectController {
  constructor(private readonly projects: ProjectService) {}

  @Get()
  @RequirePermissions(Permission.PROJECT_VIEW)
  list(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string) {
    return this.projects.list(workspaceId, user.id);
  }

  @Post()
  @RequirePermissions(Permission.PROJECT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Body() dto: CreateProjectDto) {
    return this.projects.create(workspaceId, user.id, dto);
  }

  @Get(':projectId')
  @RequirePermissions(Permission.PROJECT_VIEW)
  get(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string) {
    return this.projects.get(workspaceId, projectId, user.id);
  }

  @Patch(':projectId')
  @RequirePermissions(Permission.PROJECT_UPDATE)
  update(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(workspaceId, projectId, user.id, dto);
  }

  @Delete(':projectId')
  @RequirePermissions(Permission.PROJECT_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string) {
    await this.projects.remove(workspaceId, projectId, user.id);
  }
}
