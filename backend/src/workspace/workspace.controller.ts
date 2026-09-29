import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { WorkspacePermissionGuard } from '../auth/workspace-permission.guard.js';
import { Permission, RequirePermissions } from '../auth/workspace-permission.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { WorkspaceService } from './workspace.service.js';

@Controller('workspaces')
@UseGuards(AuthGuard, WorkspacePermissionGuard)
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
  @RequirePermissions(Permission.MEMBER_VIEW)
  get(@CurrentUser() user: AuthUser, @Param('workspaceId') id: string) {
    return this.workspaces.get(user.id, id);
  }

  @Patch(':workspaceId')
  @RequirePermissions(Permission.WORKSPACE_UPDATE)
  update(@CurrentUser() user: AuthUser, @Param('workspaceId') id: string, @Body() dto: UpdateWorkspaceDto) {
    return this.workspaces.update(user.id, id, dto);
  }

  @Delete(':workspaceId')
  @RequirePermissions(Permission.WORKSPACE_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthUser, @Param('workspaceId') id: string) {
    await this.workspaces.remove(user.id, id);
  }

  @Post(':workspaceId/members')
  @RequirePermissions(Permission.MEMBER_INVITE)
  @HttpCode(HttpStatus.CREATED)
  addMember(@CurrentUser() user: AuthUser, @Param('workspaceId') id: string, @Body() dto: AddMemberDto) {
    return this.workspaces.addMember(user.id, id, dto);
  }

  @Patch(':workspaceId/members/:memberId')
  @RequirePermissions(Permission.MEMBER_UPDATE_ROLE)
  updateMember(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.workspaces.updateMember(user.id, workspaceId, memberId, dto);
  }

  @Delete(':workspaceId/members/:memberId')
  @RequirePermissions(Permission.MEMBER_REMOVE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
  ) {
    await this.workspaces.removeMember(user.id, workspaceId, memberId);
  }
}
