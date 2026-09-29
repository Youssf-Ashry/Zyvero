import { IsIn } from 'class-validator';
import { WorkspaceRole } from '@prisma/client';

export class UpdateMemberDto {
  @IsIn([WorkspaceRole.ADMIN, WorkspaceRole.MEMBER], {
    message: 'Only ADMIN or MEMBER roles can be assigned through this endpoint.',
  })
  role!: Exclude<WorkspaceRole, 'OWNER'>;
}
