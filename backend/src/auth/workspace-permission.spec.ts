import { describe, expect, it } from 'vitest';
import { validate } from 'class-validator';
import { WorkspaceRole } from '@prisma/client';
import { Permission, workspaceRolePermissions } from './workspace-permission.js';
import { UpdateMemberDto } from '../workspace/dto/update-member.dto.js';
import { AddMemberDto } from '../workspace/dto/add-member.dto.js';
import { WorkspaceService } from '../workspace/workspace.service.js';

describe('workspace role permissions', () => {
  it('gives owners every workspace permission', () => {
    expect(workspaceRolePermissions[WorkspaceRole.OWNER]).toEqual(
      expect.arrayContaining(Object.values(Permission)),
    );
  });

  it('keeps task assignment out of member permissions', () => {
    expect(workspaceRolePermissions[WorkspaceRole.MEMBER]).not.toContain(
      Permission.TASK_ASSIGN,
    );
    expect(workspaceRolePermissions[WorkspaceRole.ADMIN]).toContain(
      Permission.TASK_ASSIGN,
    );
  });

  it('keeps workspace deletion owner-only', () => {
    expect(workspaceRolePermissions[WorkspaceRole.ADMIN]).not.toContain(
      Permission.WORKSPACE_DELETE,
    );
    expect(workspaceRolePermissions[WorkspaceRole.OWNER]).toContain(
      Permission.WORKSPACE_DELETE,
    );
  });

  it('rejects OWNER during runtime member-role validation', async () => {
    const dto = Object.assign(new UpdateMemberDto(), {
      role: WorkspaceRole.OWNER,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.constraints?.isIn).toContain(
      'Only ADMIN or MEMBER roles can be assigned through this endpoint.',
    );
  });

  it('rejects OWNER during runtime add-member validation', async () => {
    const dto = Object.assign(new AddMemberDto(), {
      email: 'existing@example.com',
      role: WorkspaceRole.OWNER,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.constraints?.isIn).toContain(
      'Only ADMIN or MEMBER roles can be assigned through this endpoint.',
    );
  });

  it('does not allow a member to update roles', async () => {
    const service = new WorkspaceService({
      workspaceMember: {
        findUnique: async () => ({ role: WorkspaceRole.MEMBER }),
      },
    } as never, {} as never);
    await expect(
      service.updateMember('member-id', 'workspace-id', 'target-id', {
        role: WorkspaceRole.MEMBER,
      }),
    ).rejects.toThrow('Workspace administrator access required');
  });

  it('does not allow an existing owner to be demoted', async () => {
    const service = new WorkspaceService({
      workspaceMember: {
        findUnique: async ({ where }: { where: unknown }) =>
          JSON.stringify(where).includes('target-id')
            ? { role: WorkspaceRole.OWNER }
            : { role: WorkspaceRole.ADMIN },
      },
    } as never, {} as never);
    await expect(
      service.updateMember('admin-id', 'workspace-id', 'target-id', {
        role: WorkspaceRole.MEMBER,
      }),
    ).rejects.toThrow('The workspace owner role cannot be changed');
  });

  it('does not allow an admin to promote a member to owner at the service boundary', async () => {
    const service = new WorkspaceService({
      workspaceMember: {
        findUnique: async () => ({ role: WorkspaceRole.ADMIN }),
      },
    } as never, {} as never);
    await expect(
      service.updateMember('admin-id', 'workspace-id', 'target-id', {
        role: WorkspaceRole.OWNER as never,
      }),
    ).rejects.toThrow(
      'Only ADMIN or MEMBER roles can be assigned through this endpoint.',
    );
  });
});
