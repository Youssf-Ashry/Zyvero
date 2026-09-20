import { Module } from '@nestjs/common';
import {
  ServicesController,
  AdminServicesController,
} from './services.controller.js';
import { ServicesService } from './services.service.js';

@Module({
  controllers: [ServicesController, AdminServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
