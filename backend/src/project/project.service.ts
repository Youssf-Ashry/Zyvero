import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectStatus, WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorkspaceService } from '../workspace/workspace.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspace: WorkspaceService,
  ) {}

  async assertProject(workspaceId: string, projectId: string, userId: string) {
    const member = await this.workspace.assertMember(workspaceId, userId);
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, workspaceId },
    });
    if (!project) throw new NotFoundException('Project not found');
    return { member, project };
  }

  async assertProjectManager(workspaceId: string, projectId: string, userId: string) {
    const result = await this.assertProject(workspaceId, projectId, userId);
    if (
      result.member.role !== WorkspaceRole.OWNER &&
      result.member.role !== WorkspaceRole.ADMIN &&
      result.project.ownerId !== userId
    ) {
      throw new ForbiddenException('Project owner or workspace administrator access required');
    }
    return result;
  }

  list(workspaceId: string, userId: string) {
    return this.workspace.assertMember(workspaceId, userId).then(() =>
      this.prisma.project.findMany({
        where: { workspaceId },
        include: { _count: { select: { tasks: true, contents: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async create(workspaceId: string, userId: string, dto: CreateProjectDto) {
    await this.workspace.assertMember(workspaceId, userId);
    return this.prisma.project.create({
      data: {
        workspaceId,
        ownerId: userId,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        status: dto.status ?? ProjectStatus.PLANNING,
      },
    });
  }

  async get(workspaceId: string, projectId: string, userId: string) {
    await this.assertProject(workspaceId, projectId, userId);
    return this.prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: true, contents: true },
    });
  }

  async update(workspaceId: string, projectId: string, userId: string, dto: UpdateProjectDto) {
    await this.assertProjectManager(workspaceId, projectId, userId);
    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        status: dto.status,
      },
    });
  }

  async remove(workspaceId: string, projectId: string, userId: string) {
    await this.assertProjectManager(workspaceId, projectId, userId);
    await this.prisma.project.delete({ where: { id: projectId } });
  }
}
