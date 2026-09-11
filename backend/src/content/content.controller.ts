import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { CreateContentDto } from './dto/create-content.dto.js';
import { UpdateContentDto } from './dto/update-content.dto.js';
import { ContentService } from './content.service.js';

@Controller('workspaces/:workspaceId/projects/:projectId/content')
@UseGuards(AuthGuard)
export class ContentController {
  constructor(private readonly content: ContentService) {}
  @Get()
  list(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string) {
    return this.content.list(workspaceId, projectId, user.id);
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Body() dto: CreateContentDto) {
    return this.content.create(workspaceId, projectId, user.id, dto);
  }
  @Get(':contentId')
  get(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('contentId') contentId: string) {
    return this.content.get(workspaceId, projectId, contentId, user.id);
  }
  @Patch(':contentId')
  update(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('contentId') contentId: string, @Body() dto: UpdateContentDto) {
    return this.content.update(workspaceId, projectId, contentId, user.id, dto);
  }
  @Delete(':contentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('contentId') contentId: string) {
    await this.content.remove(workspaceId, projectId, contentId, user.id);
  }
}
