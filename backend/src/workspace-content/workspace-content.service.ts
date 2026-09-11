import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorkspaceService } from '../workspace/workspace.service.js';
import { CreateWorkspaceContentDto } from './dto/create-workspace-content.dto.js';
import { UpdateWorkspaceContentDto } from './dto/update-workspace-content.dto.js';

@Injectable()
export class WorkspaceContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaces: WorkspaceService,
  ) {}

  async list(workspaceId: string, userId: string) {
    await this.workspaces.assertMember(workspaceId, userId);
    return this.prisma.workspaceContent.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(workspaceId: string, userId: string, dto: CreateWorkspaceContentDto) {
    await this.workspaces.assertMember(workspaceId, userId);
    return this.prisma.workspaceContent.create({
      data: {
        workspaceId,
        title: dto.title.trim(),
        content: dto.content.trim(),
        type: dto.type,
      },
    });
  }

  async get(workspaceId: string, contentId: string, userId: string) {
    await this.workspaces.assertMember(workspaceId, userId);
    const content = await this.prisma.workspaceContent.findFirst({
      where: { id: contentId, workspaceId },
    });
    if (!content) throw new NotFoundException('Workspace content not found');
    return content;
  }

  async update(
    workspaceId: string,
    contentId: string,
    userId: string,
    dto: UpdateWorkspaceContentDto,
  ) {
    await this.get(workspaceId, contentId, userId);
    return this.prisma.workspaceContent.update({
      where: { id: contentId },
      data: {
        title: dto.title?.trim(),
        content: dto.content?.trim(),
        type: dto.type,
      },
    });
  }

  async remove(workspaceId: string, contentId: string, userId: string) {
    await this.get(workspaceId, contentId, userId);
    await this.prisma.workspaceContent.delete({ where: { id: contentId } });
  }
}
