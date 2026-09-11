import { Module } from '@nestjs/common';
import { ProjectModule } from '../project/project.module.js';
import { ContentController } from './content.controller.js';
import { ContentService } from './content.service.js';

@Module({
  imports: [ProjectModule],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
