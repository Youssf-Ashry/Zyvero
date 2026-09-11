import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import { WorkspaceService } from './workspace.service.js';

@Controller('workspaces')
@UseGuards(AuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaces: WorkspaceService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) { return this.workspaces.list(user.id); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateWorkspaceDto) {
    return this.workspaces.create(user.id, dto);
  }

  @Get(':workspaceId')
  get(@CurrentUser() user: AuthUser, @Param('workspaceId') id: string) {
    return this.workspaces.get(user.id, id);
  }

  @Patch(':workspaceId')
  update(@CurrentUser() user: AuthUser, @Param('workspaceId') id: string, @Body() dto: UpdateWorkspaceDto) {
    return this.workspaces.update(user.id, id, dto);
  }

  @Delete(':workspaceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthUser, @Param('workspaceId') id: string) {
    await this.workspaces.remove(user.id, id);
  }

  @Post(':workspaceId/members')
  @HttpCode(HttpStatus.CREATED)
  addMember(@CurrentUser() user: AuthUser, @Param('workspaceId') id: string, @Body() dto: AddMemberDto) {
    return this.workspaces.addMember(user.id, id, dto);
  }
}
