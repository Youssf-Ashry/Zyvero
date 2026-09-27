import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCustomerRequestDto } from './dto/create-customer-request.dto.js';
import {
  AdminRequestQueryDto,
  RequestDateRange,
} from './dto/admin-request-query.dto.js';

const customerSelect = {
  id: true,
  name: true,
  email: true,
} as const;

const requestInclude = {
  service: true,
  customer: { select: customerSelect },
} as const;

@Injectable()
export class CustomerRequestService {
  constructor(private readonly prisma: PrismaService) {}

  listForCustomer(customerId: string) {
    return this.prisma.customerRequest.findMany({
      where: { customerId },
      include: { service: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getForCustomer(id: string, customerId: string) {
    const request = await this.prisma.customerRequest.findUnique({
      where: { id },
      include: { service: true, customer: { select: customerSelect } },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.customerId !== customerId) {
      throw new ForbiddenException('You cannot access this request');
    }
    return request;
  }

  async create(customerId: string, dto: CreateCustomerRequestDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      select: { id: true, isActive: true },
    });
    if (!service) throw new NotFoundException('Service not found');
    if (!service.isActive) {
      throw new BadRequestException('This service is not currently available');
    }
    try {
      return await this.prisma.customerRequest.create({
        data: {
          customerId,
          serviceId: dto.serviceId,
          title: dto.title.trim(),
          description: dto.description.trim(),
        },
        include: { service: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException('Service not found');
      }
      throw error;
    }
  }

  listForAdmin(query: AdminRequestQueryDto = {}) {
    const search = query.search?.trim();
    const dateStart = this.dateStart(query.dateRange);
    return this.prisma.customerRequest.findMany({
      where: {
        ...(query.status && query.status !== 'ALL'
          ? { status: query.status }
          : {}),
        ...(query.serviceId ? { serviceId: query.serviceId } : {}),
        ...(dateStart ? { createdAt: { gte: dateStart } } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                {
                  customer: { name: { contains: search, mode: 'insensitive' } },
                },
                {
                  customer: {
                    email: { contains: search, mode: 'insensitive' },
                  },
                },
                {
                  service: { name: { contains: search, mode: 'insensitive' } },
                },
              ],
            }
          : {}),
      },
      include: requestInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  private dateStart(range?: RequestDateRange) {
    if (!range || range === RequestDateRange.ALL) return undefined;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (range === RequestDateRange.LAST_7_DAYS)
      start.setDate(start.getDate() - 6);
    if (range === RequestDateRange.LAST_30_DAYS)
      start.setDate(start.getDate() - 29);
    return start;
  }

  async getForAdmin(id: string) {
    const request = await this.prisma.customerRequest.findUnique({
      where: { id },
      include: requestInclude,
    });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async updateStatus(id: string, status: RequestStatus) {
    await this.getForAdmin(id);
    return this.prisma.customerRequest.update({
      where: { id },
      data: { status },
      include: requestInclude,
    });
  }
}
