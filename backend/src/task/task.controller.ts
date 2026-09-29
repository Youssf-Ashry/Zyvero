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
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { WorkspacePermissionGuard } from '../auth/workspace-permission.guard.js';
import { Permission, RequirePermissions } from '../auth/workspace-permission.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskService } from './task.service.js';
import { TaskQueryDto } from './dto/task-query.dto.js';

@Controller('workspaces/:workspaceId/tasks')
@UseGuards(AuthGuard, WorkspacePermissionGuard)
export class WorkspaceTaskController {
  constructor(private readonly tasks: TaskService) {}

  @Get()
  @RequirePermissions(Permission.TASK_VIEW)
  list(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasks.listWorkspace(workspaceId, user.id, query);
  }
}

@Controller('workspaces/:workspaceId/projects/:projectId/tasks')
@UseGuards(AuthGuard, WorkspacePermissionGuard)
export class TaskController {
  constructor(private readonly tasks: TaskService) {}
  @Get()
  @RequirePermissions(Permission.TASK_VIEW)
  list(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.tasks.list(workspaceId, projectId, user.id);
  }
  @Post()
  @RequirePermissions(Permission.TASK_CREATE)
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasks.create(workspaceId, projectId, user.id, dto);
  }
  @Get(':taskId')
  @RequirePermissions(Permission.TASK_VIEW)
  get(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasks.get(workspaceId, projectId, taskId, user.id);
  }
  @Patch(':taskId')
  @RequirePermissions(Permission.TASK_UPDATE)
  update(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(workspaceId, projectId, taskId, user.id, dto);
  }
  @Delete(':taskId')
  @RequirePermissions(Permission.TASK_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    await this.tasks.remove(workspaceId, projectId, taskId, user.id);
  }
}
