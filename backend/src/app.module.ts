import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module.js';
import { appConfig } from './config/app.config.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ContactModule } from './contact/contact.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { WorkspaceModule } from './workspace/workspace.module.js';
import { ProjectModule } from './project/project.module.js';
import { TaskModule } from './task/task.module.js';
import { ContentModule } from './content/content.module.js';
import { WorkspaceContentModule } from './workspace-content/workspace-content.module.js';
import { ServicesModule } from './services/services.module.js';
import { CustomerRequestModule } from './customer-request/customer-request.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [appConfig],
    }),
    AiModule,
    PrismaModule,
    ContactModule,
    AuthModule,
    WorkspaceModule,
    ProjectModule,
    TaskModule,
    ContentModule,
    WorkspaceContentModule,
    ServicesModule,
    CustomerRequestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
