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
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { CreateWorkspaceContentDto } from './dto/create-workspace-content.dto.js';
import { UpdateWorkspaceContentDto } from './dto/update-workspace-content.dto.js';
import { WorkspaceContentService } from './workspace-content.service.js';

@Controller('workspaces/:workspaceId/content')
@UseGuards(AuthGuard)
export class WorkspaceContentController {
  constructor(private readonly content: WorkspaceContentService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string) {
    return this.content.list(workspaceId, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateWorkspaceContentDto,
  ) {
    return this.content.create(workspaceId, user.id, dto);
  }

  @Get(':id')
  get(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('id') contentId: string,
  ) {
    return this.content.get(workspaceId, contentId, user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('id') contentId: string,
    @Body() dto: UpdateWorkspaceContentDto,
  ) {
    return this.content.update(workspaceId, contentId, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('id') contentId: string,
  ) {
    await this.content.remove(workspaceId, contentId, user.id);
  }
}
