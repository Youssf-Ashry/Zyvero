import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectContentType, WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProjectService } from '../project/project.service.js';
import { CreateContentDto } from './dto/create-content.dto.js';
import { UpdateContentDto } from './dto/update-content.dto.js';

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectService,
  ) {}

  async list(workspaceId: string, projectId: string, userId: string) {
    await this.projects.assertProject(workspaceId, projectId, userId);
    return this.prisma.projectContent.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
  }

  async create(workspaceId: string, projectId: string, userId: string, dto: CreateContentDto) {
    await this.projects.assertProject(workspaceId, projectId, userId);
    return this.prisma.projectContent.create({
      data: {
        projectId, creatorId: userId, title: dto.title.trim(), content: dto.content,
        type: dto.type ?? ProjectContentType.NOTE, url: dto.url,
      },
    });
  }

  async get(workspaceId: string, projectId: string, contentId: string, userId: string) {
    await this.projects.assertProject(workspaceId, projectId, userId);
    const content = await this.prisma.projectContent.findFirst({ where: { id: contentId, projectId } });
    if (!content) throw new NotFoundException('Project content not found');
    return content;
  }

  async update(workspaceId: string, projectId: string, contentId: string, userId: string, dto: UpdateContentDto) {
    const { member, project } = await this.projects.assertProject(workspaceId, projectId, userId);
    const content = await this.get(workspaceId, projectId, contentId, userId);
    if (member.role === WorkspaceRole.MEMBER && project.ownerId !== userId && content.creatorId !== userId) {
      throw new ForbiddenException('You do not own this content');
    }
    return this.prisma.projectContent.update({
      where: { id: contentId },
      data: { title: dto.title?.trim(), content: dto.content, type: dto.type, url: dto.url },
    });
  }

  async remove(workspaceId: string, projectId: string, contentId: string, userId: string) {
    const { member, project } = await this.projects.assertProject(workspaceId, projectId, userId);
    const content = await this.get(workspaceId, projectId, contentId, userId);
    if (member.role === WorkspaceRole.MEMBER && project.ownerId !== userId && content.creatorId !== userId) {
      throw new ForbiddenException('You do not own this content');
    }
    await this.prisma.projectContent.delete({ where: { id: contentId } });
  }
}
