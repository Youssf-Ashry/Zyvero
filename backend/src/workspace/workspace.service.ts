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
import { WorkspacePermissionService } from '../auth/workspace-permission.service.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: WorkspacePermissionService,
  ) {}

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
      include: {
        _count: { select: { members: true, projects: true } },
        members: { where: { userId }, select: { role: true } },
      },
      orderBy: { createdAt: 'asc' },
    }).then((workspaces) =>
      workspaces.map(({ members, ...workspace }) => ({
        ...workspace,
        role: members[0]?.role,
        permissions: members[0]
          ? this.permissions.permissionsForRole(members[0].role)
          : [],
      })),
    );
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
      include: {
        members: {
          select: {
            id: true,
            role: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { projects: true } },
      },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return {
      ...workspace,
      members: workspace.members.map(({ user, role }) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role,
      })),
    };
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
    const requestedRole = dto.role as WorkspaceRole;
    if (requestedRole === WorkspaceRole.OWNER) {
      throw new ForbiddenException(
        'Only ADMIN or MEMBER roles can be assigned through this endpoint.',
      );
    }
    await this.assertManager(workspaceId, userId);
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');
    try {
      return await this.prisma.workspaceMember.create({
        data: { workspaceId, userId: user.id, role: dto.role },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    } catch (error) {
      this.mapUniqueError(error);
      throw error;
    }
  }

  async updateMember(
    userId: string,
    workspaceId: string,
    memberId: string,
    dto: UpdateMemberDto,
  ) {
    const requestedRole = dto.role as WorkspaceRole;
    if (requestedRole === WorkspaceRole.OWNER) {
      throw new ForbiddenException(
        'Only ADMIN or MEMBER roles can be assigned through this endpoint.',
      );
    }
    await this.assertManager(workspaceId, userId);
    const target = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: memberId } },
    });
    if (!target) throw new NotFoundException('Workspace member not found');
    if (target.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('The workspace owner role cannot be changed');
    }
    return this.prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId: memberId } },
      data: { role: dto.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async removeMember(userId: string, workspaceId: string, memberId: string) {
    await this.assertManager(workspaceId, userId);
    const target = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: memberId } },
    });
    if (!target) throw new NotFoundException('Workspace member not found');
    if (target.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('The workspace owner cannot be removed');
    }
    await this.prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId: memberId } },
    });
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
