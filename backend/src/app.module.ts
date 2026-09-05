import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module.js';
import { appConfig } from './config/app.config.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [appConfig],
    }),
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
