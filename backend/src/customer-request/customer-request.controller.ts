import {
  Body,
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
import { AdminRequestQueryDto } from './dto/admin-request-query.dto.js';

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
  list(@Query() query: AdminRequestQueryDto) {
    return this.requests.listForAdmin(query);
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
