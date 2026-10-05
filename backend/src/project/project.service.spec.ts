import { describe, expect, it, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { ProjectService } from './project.service.js';
import { Permission } from '../auth/workspace-permission.js';
import { ProjectStatus, WorkspaceRole } from '@prisma/client';

const person = { id: 'user-id', name: 'User', email: 'user@example.com', avatarUrl: null };

function createService() {
  const project = {
    id: 'project-id',
    workspaceId: 'workspace-id',
    ownerId: 'user-id',
    clientId: 'client-id',
    name: 'Project',
    description: 'Description',
    status: ProjectStatus.IN_PROGRESS,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const prisma = {
    project: {
      findMany: vi.fn(),
      findFirst: vi.fn().mockResolvedValue(project),
      findUnique: vi.fn(),
      create: vi.fn().mockResolvedValue(project),
      delete: vi.fn(),
    },
    workspaceMember: {
      findUnique: vi.fn().mockResolvedValue({ id: 'membership-id', userId: 'client-id' }),
      findMany: vi.fn().mockResolvedValue([{ id: 'membership-id', userId: 'member-id' }]),
    },
    $transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
      callback({
        project: {
          create: vi.fn().mockResolvedValue(project),
          findUniqueOrThrow: vi.fn().mockResolvedValue({
            ...project,
            owner: person,
            client: { ...person, id: 'client-id', name: 'Client' },
            members: [],
            tasks: [],
            contents: [],
            _count: { tasks: 0, contents: 0 },
          }),
          update: vi.fn().mockResolvedValue(project),
        },
        projectMember: {
          deleteMany: vi.fn().mockResolvedValue(undefined),
          createMany: vi.fn().mockResolvedValue(undefined),
        },
      }),
    ),
  };
  const workspace = {
    assertMember: vi.fn().mockResolvedValue({ role: WorkspaceRole.ADMIN }),
  };
  const permissions = {
    assertPermission: vi.fn().mockResolvedValue(undefined),
  };
  return {
    service: new ProjectService(prisma as never, workspace as never, permissions as never),
    prisma,
    workspace,
    permissions,
  };
}

describe('ProjectService Task 11 extensions', () => {
  it('derives progress from completed actionable tasks', async () => {
    const { service, prisma } = createService();
    prisma.project.findMany.mockResolvedValue([{
      id: 'project-id',
      name: 'Project',
      description: null,
      status: ProjectStatus.NOT_STARTED,
      owner: person,
      client: null,
      members: [],
      tasks: [
        { status: 'DONE' },
        { status: 'IN_PROGRESS' },
        { status: 'CANCELED' },
      ],
      _count: { tasks: 3, contents: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);

    const [result] = await service.list('workspace-id', 'user-id');

    expect(result).toMatchObject({
      taskCount: 3,
      completedTaskCount: 1,
      progress: 50,
    });
  });

  it('rejects project members from another workspace', async () => {
    const { service, prisma } = createService();
    prisma.workspaceMember.findMany.mockResolvedValue([]);

    await expect(
      service.create('workspace-id', 'user-id', {
        name: 'Project',
        projectMemberIds: ['foreign-user-id'],
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('requires project assignment permission for client or member assignments', async () => {
    const { service, permissions } = createService();
    permissions.assertPermission.mockRejectedValue(
      new ForbiddenException('You do not have permission for this operation'),
    );

    await expect(
      service.create('workspace-id', 'user-id', {
        name: 'Project',
        clientId: 'client-id',
      }),
    ).rejects.toThrow('You do not have permission for this operation');
    expect(permissions.assertPermission).toHaveBeenCalledWith(
      'workspace-id',
      'user-id',
      Permission.PROJECT_ASSIGN,
    );
  });
});
