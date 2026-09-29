import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { WorkspacePermissionGuard } from '../auth/workspace-permission.guard.js';
import { Permission, RequirePermissions } from '../auth/workspace-permission.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { CreateContentDto } from './dto/create-content.dto.js';
import { UpdateContentDto } from './dto/update-content.dto.js';
import { ContentService } from './content.service.js';

@Controller('workspaces/:workspaceId/projects/:projectId/content')
@UseGuards(AuthGuard, WorkspacePermissionGuard)
export class ContentController {
  constructor(private readonly content: ContentService) {}
  @Get()
  @RequirePermissions(Permission.KNOWLEDGE_VIEW)
  list(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string) {
    return this.content.list(workspaceId, projectId, user.id);
  }
  @Post()
  @RequirePermissions(Permission.KNOWLEDGE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Body() dto: CreateContentDto) {
    return this.content.create(workspaceId, projectId, user.id, dto);
  }
  @Get(':contentId')
  @RequirePermissions(Permission.KNOWLEDGE_VIEW)
  get(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('contentId') contentId: string) {
    return this.content.get(workspaceId, projectId, contentId, user.id);
  }
  @Patch(':contentId')
  @RequirePermissions(Permission.KNOWLEDGE_UPDATE)
  update(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('contentId') contentId: string, @Body() dto: UpdateContentDto) {
    return this.content.update(workspaceId, projectId, contentId, user.id, dto);
  }
  @Delete(':contentId')
  @RequirePermissions(Permission.KNOWLEDGE_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('contentId') contentId: string) {
    await this.content.remove(workspaceId, projectId, contentId, user.id);
  }
}
