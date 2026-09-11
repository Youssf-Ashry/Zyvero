import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async assertMember(workspaceId: string, userId: string) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!membership) throw new ForbiddenException('You are not a workspace member');
    return membership;
  }

  async assertManager(workspaceId: string, userId: string) {
    const member = await this.assertMember(workspaceId, userId);
    if (member.role !== WorkspaceRole.OWNER && member.role !== WorkspaceRole.ADMIN) {
      throw new ForbiddenException('Workspace administrator access required');
    }
    return member;
  }

  list(userId: string) {
    return this.prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      include: { _count: { select: { members: true, projects: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, dto: CreateWorkspaceDto) {
    const slug = dto.slug ?? this.slugify(dto.name);
    try {
      return await this.prisma.workspace.create({
        data: {
          name: dto.name.trim(),
          slug,
          ownerId: userId,
          members: { create: { userId, role: WorkspaceRole.OWNER } },
        },
        include: { members: true },
      });
    } catch (error) {
      this.mapUniqueError(error);
      throw error;
    }
  }

  async get(userId: string, workspaceId: string) {
    await this.assertMember(workspaceId, userId);
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { include: { user: { select: { id: true, name: true, email: true } } } }, _count: { select: { projects: true } } },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async update(userId: string, workspaceId: string, dto: UpdateWorkspaceDto) {
    await this.assertManager(workspaceId, userId);
    try {
      return await this.prisma.workspace.update({
        where: { id: workspaceId },
        data: { name: dto.name?.trim(), slug: dto.slug },
      });
    } catch (error) {
      this.mapUniqueError(error);
      throw error;
    }
  }

  async remove(userId: string, workspaceId: string) {
    const member = await this.assertMember(workspaceId, userId);
    if (member.role !== WorkspaceRole.OWNER) {
      throw new ForbiddenException('Only the workspace owner can delete it');
    }
    await this.prisma.workspace.delete({ where: { id: workspaceId } });
  }

  async addMember(userId: string, workspaceId: string, dto: AddMemberDto) {
    await this.assertManager(workspaceId, userId);
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');
    try {
      return await this.prisma.workspaceMember.create({
        data: { workspaceId, userId: user.id, role: dto.role === WorkspaceRole.OWNER ? WorkspaceRole.ADMIN : dto.role },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    } catch (error) {
      this.mapUniqueError(error);
      throw error;
    }
  }

  private mapUniqueError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Workspace slug or membership already exists');
    }
  }

  private slugify(value: string) {
    return `${value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 42) || 'workspace'}-${Date.now().toString(36)}`;
  }
}
