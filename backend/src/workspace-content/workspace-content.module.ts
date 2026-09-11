import { Module } from '@nestjs/common';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { WorkspaceContentController } from './workspace-content.controller.js';
import { WorkspaceContentService } from './workspace-content.service.js';

@Module({
  imports: [WorkspaceModule],
  controllers: [WorkspaceContentController],
  providers: [WorkspaceContentService],
})
export class WorkspaceContentModule {}
