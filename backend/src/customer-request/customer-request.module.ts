import { Module } from '@nestjs/common';
import {
  AdminCustomerRequestController,
  CustomerRequestController,
} from './customer-request.controller.js';
import { CustomerRequestService } from './customer-request.service.js';

@Module({
  controllers: [CustomerRequestController, AdminCustomerRequestController],
  providers: [CustomerRequestService],
})
export class CustomerRequestModule {}
