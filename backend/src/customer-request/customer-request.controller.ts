import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { CreateCustomerRequestDto } from './dto/create-customer-request.dto.js';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto.js';
import { CustomerRequestService } from './customer-request.service.js';
import { RequestStatus } from '@prisma/client';

@Controller('requests')
@UseGuards(AuthGuard)
export class CustomerRequestController {
  constructor(private readonly requests: CustomerRequestService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCustomerRequestDto) {
    return this.requests.create(user.id, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.requests.listForCustomer(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.requests.getForCustomer(id, user.id);
  }
}

@Controller('admin/requests')
@UseGuards(AuthGuard, AdminGuard)
export class AdminCustomerRequestController {
  constructor(private readonly requests: CustomerRequestService) {}

  @Get()
  list(@Query('status') status?: string) {
    if (
      status &&
      !Object.values(RequestStatus).includes(status as RequestStatus)
    ) {
      throw new BadRequestException('Invalid request status');
    }
    return this.requests.listForAdmin(status as RequestStatus | undefined);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.requests.getForAdmin(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateRequestStatusDto) {
    return this.requests.updateStatus(id, dto.status);
  }
}
