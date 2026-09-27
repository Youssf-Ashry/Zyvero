import { Module } from '@nestjs/common';
import { ProjectModule } from '../project/project.module.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { TaskController, WorkspaceTaskController } from './task.controller.js';
import { TaskService } from './task.service.js';

@Module({
  imports: [ProjectModule, WorkspaceModule],
  controllers: [TaskController, WorkspaceTaskController],
  providers: [TaskService],
})
export class TaskModule {}
