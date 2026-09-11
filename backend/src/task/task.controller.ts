import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskService } from './task.service.js';

@Controller('workspaces/:workspaceId/projects/:projectId/tasks')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private readonly tasks: TaskService) {}
  @Get()
  list(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string) {
    return this.tasks.list(workspaceId, projectId, user.id);
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Body() dto: CreateTaskDto) {
    return this.tasks.create(workspaceId, projectId, user.id, dto);
  }
  @Get(':taskId')
  get(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('taskId') taskId: string) {
    return this.tasks.get(workspaceId, projectId, taskId, user.id);
  }
  @Patch(':taskId')
  update(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('taskId') taskId: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(workspaceId, projectId, taskId, user.id, dto);
  }
  @Delete(':taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('taskId') taskId: string) {
    await this.tasks.remove(workspaceId, projectId, taskId, user.id);
  }
}
