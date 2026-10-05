import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProjectStatus, WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { Permission } from '../auth/workspace-permission.js';
import { WorkspacePermissionService } from '../auth/workspace-permission.service.js';
import { WorkspaceService } from '../workspace/workspace.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} as const;

const projectListInclude = {
  owner: { select: safeUserSelect },
  client: { select: safeUserSelect },
  members: {
    include: {
      workspaceMember: { include: { user: { select: safeUserSelect } } },
    },
  },
  tasks: { select: { status: true } },
  _count: { select: { tasks: true, contents: true } },
} as const;

const projectDetailInclude = {
  ...projectListInclude,
  tasks: true,
  contents: true,
} as const;

type ProjectListRecord = Prisma.ProjectGetPayload<{ include: typeof projectListInclude }>;
type ProjectDetailRecord = Prisma.ProjectGetPayload<{ include: typeof projectDetailInclude }>;

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspace: WorkspaceService,
    private readonly permissions: WorkspacePermissionService,
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

  async list(workspaceId: string, userId: string) {
    await this.workspace.assertMember(workspaceId, userId);
    const projects = await this.prisma.project.findMany({
      where: { workspaceId },
      include: projectListInclude,
      orderBy: { createdAt: 'desc' },
    });
    return projects.map((project) => this.mapProject(project));
  }

  async create(workspaceId: string, userId: string, dto: CreateProjectDto) {
    await this.workspace.assertMember(workspaceId, userId);
    if (dto.clientId !== undefined || dto.projectMemberIds !== undefined) {
      await this.permissions.assertPermission(workspaceId, userId, Permission.PROJECT_ASSIGN);
    }
    const assignments = await this.validateAssignments(
      workspaceId,
      dto.clientId,
      dto.projectMemberIds,
    );
    const project = await this.prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          workspaceId,
          ownerId: userId,
          name: dto.name.trim(),
          description: dto.description?.trim(),
          status: dto.status ?? ProjectStatus.NOT_STARTED,
          clientId: dto.clientId,
        },
      });
      await this.replaceMembers(tx, created.id, assignments.workspaceMemberIds);
      return tx.project.findUniqueOrThrow({
        where: { id: created.id },
        include: projectDetailInclude,
      });
    });
    return this.mapProject(project);
  }

  async get(workspaceId: string, projectId: string, userId: string) {
    await this.assertProject(workspaceId, projectId, userId);
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: projectDetailInclude,
    });
    if (!project) throw new NotFoundException('Project not found');
    return this.mapProject(project);
  }

  async update(workspaceId: string, projectId: string, userId: string, dto: UpdateProjectDto) {
    await this.assertProjectManager(workspaceId, projectId, userId);
    if (dto.clientId !== undefined || dto.projectMemberIds !== undefined) {
      await this.permissions.assertPermission(workspaceId, userId, Permission.PROJECT_ASSIGN);
    }
    const assignments = await this.validateAssignments(
      workspaceId,
      dto.clientId,
      dto.projectMemberIds,
    );
    const project = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({
        where: { id: projectId },
        data: {
          name: dto.name?.trim(),
          description: dto.description?.trim(),
          status: dto.status,
          ...(dto.clientId !== undefined ? { clientId: dto.clientId } : {}),
        },
      });
      if (dto.projectMemberIds !== undefined) {
        await this.replaceMembers(tx, projectId, assignments.workspaceMemberIds);
      }
      return tx.project.findUniqueOrThrow({
        where: { id: updated.id },
        include: projectDetailInclude,
      });
    });
    return this.mapProject(project);
  }

  async remove(workspaceId: string, projectId: string, userId: string) {
    await this.assertProjectManager(workspaceId, projectId, userId);
    await this.prisma.project.delete({ where: { id: projectId } });
  }

  private async validateAssignments(
    workspaceId: string,
    clientId?: string | null,
    projectMemberIds?: string[],
  ) {
    if (clientId !== undefined && clientId !== null) {
      const client = await this.prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: clientId } },
      });
      if (!client) throw new ForbiddenException('The selected client is not in this workspace');
    }
    if (projectMemberIds === undefined) return { workspaceMemberIds: undefined };
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId, userId: { in: projectMemberIds } },
      select: { id: true, userId: true },
    });
    if (members.length !== projectMemberIds.length) {
      throw new ForbiddenException('All project members must belong to this workspace');
    }
    return { workspaceMemberIds: members.map((member) => member.id) };
  }

  private replaceMembers(
    tx: Prisma.TransactionClient,
    projectId: string,
    projectMemberIds?: string[],
  ) {
    if (projectMemberIds === undefined) return Promise.resolve();
    return tx.projectMember.deleteMany({ where: { projectId } }).then(() => {
      if (!projectMemberIds.length) return;
      return tx.projectMember.createMany({
        data: projectMemberIds.map((workspaceMemberId) => ({
          projectId,
          workspaceMemberId,
        })),
      });
    });
  }

  private mapProject(project: ProjectListRecord | ProjectDetailRecord) {
    const tasks = project.tasks;
    const completedTaskCount = tasks.filter((task) => task.status === 'DONE').length;
    const actionableTaskCount = tasks.filter((task) => task.status !== 'CANCELED').length;
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      owner: project.owner,
      client: project.client,
      teamMembers: project.members.map(({ workspaceMember }) => workspaceMember.user),
      taskCount: project._count.tasks,
      completedTaskCount,
      progress: actionableTaskCount
        ? Math.round((completedTaskCount / actionableTaskCount) * 100)
        : 0,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      _count: project._count,
      ...(Array.isArray(tasks) && tasks.length > 0 ? { tasks } : {}),
      ...('contents' in project ? { contents: project.contents } : {}),
    };
  }
}
