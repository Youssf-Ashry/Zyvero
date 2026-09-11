import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskPriority, TaskStatus, WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProjectService } from '../project/project.service.js';
import { WorkspaceService } from '../workspace/workspace.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectService,
    private readonly workspace: WorkspaceService,
  ) {}

  async list(workspaceId: string, projectId: string, userId: string) {
    await this.projects.assertProject(workspaceId, projectId, userId);
    return this.prisma.task.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
  }

  async create(workspaceId: string, projectId: string, userId: string, dto: CreateTaskDto) {
    await this.projects.assertProject(workspaceId, projectId, userId);
    await this.assertAssignee(workspaceId, dto.assigneeId);
    return this.prisma.task.create({
      data: {
        projectId, creatorId: userId, title: dto.title.trim(), description: dto.description?.trim(),
        status: dto.status ?? TaskStatus.TODO, priority: dto.priority ?? TaskPriority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined, assigneeId: dto.assigneeId,
      },
    });
  }

  async get(workspaceId: string, projectId: string, taskId: string, userId: string) {
    await this.projects.assertProject(workspaceId, projectId, userId);
    const task = await this.prisma.task.findFirst({ where: { id: taskId, projectId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(workspaceId: string, projectId: string, taskId: string, userId: string, dto: UpdateTaskDto) {
    const { member, project } = await this.projects.assertProject(workspaceId, projectId, userId);
    const task = await this.get(workspaceId, projectId, taskId, userId);
    if (member.role === WorkspaceRole.MEMBER && project.ownerId !== userId && task.creatorId !== userId && task.assigneeId !== userId) {
      throw new ForbiddenException('You do not own this task');
    }
    await this.assertAssignee(workspaceId, dto.assigneeId);
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title?.trim(), description: dto.description?.trim(), status: dto.status,
        priority: dto.priority, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined, assigneeId: dto.assigneeId,
      },
    });
  }

  async remove(workspaceId: string, projectId: string, taskId: string, userId: string) {
    const { member, project } = await this.projects.assertProject(workspaceId, projectId, userId);
    const task = await this.get(workspaceId, projectId, taskId, userId);
    if (member.role === WorkspaceRole.MEMBER && project.ownerId !== userId && task.creatorId !== userId) {
      throw new ForbiddenException('You do not own this task');
    }
    await this.prisma.task.delete({ where: { id: taskId } });
  }

  private async assertAssignee(workspaceId: string, userId?: string) {
    if (!userId) return;
    await this.workspace.assertMember(workspaceId, userId);
  }
}
