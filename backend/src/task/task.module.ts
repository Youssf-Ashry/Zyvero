import { Module } from '@nestjs/common';
import { ProjectModule } from '../project/project.module.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { TaskController } from './task.controller.js';
import { TaskService } from './task.service.js';

@Module({
  imports: [ProjectModule, WorkspaceModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
