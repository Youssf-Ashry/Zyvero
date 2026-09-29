import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { WorkspacePermissionGuard } from '../auth/workspace-permission.guard.js';
import { Permission, RequirePermissions } from '../auth/workspace-permission.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { CreateWorkspaceContentDto } from './dto/create-workspace-content.dto.js';
import { UpdateWorkspaceContentDto } from './dto/update-workspace-content.dto.js';
import { WorkspaceContentService } from './workspace-content.service.js';

@Controller('workspaces/:workspaceId/content')
@UseGuards(AuthGuard, WorkspacePermissionGuard)
export class WorkspaceContentController {
  constructor(private readonly content: WorkspaceContentService) {}

  @Get()
  @RequirePermissions(Permission.KNOWLEDGE_VIEW)
  list(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string) {
    return this.content.list(workspaceId, user.id);
  }

  @Post()
  @RequirePermissions(Permission.KNOWLEDGE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateWorkspaceContentDto,
  ) {
    return this.content.create(workspaceId, user.id, dto);
  }

  @Get(':id')
  @RequirePermissions(Permission.KNOWLEDGE_VIEW)
  get(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('id') contentId: string,
  ) {
    return this.content.get(workspaceId, contentId, user.id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.KNOWLEDGE_UPDATE)
  update(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('id') contentId: string,
    @Body() dto: UpdateWorkspaceContentDto,
  ) {
    return this.content.update(workspaceId, contentId, user.id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.KNOWLEDGE_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('id') contentId: string,
  ) {
    await this.content.remove(workspaceId, contentId, user.id);
  }
}
