import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  listPublic() {
    return this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  listAdmin() {
    return this.prisma.service.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  get(id: string) {
    return this.prisma.service.findUnique({ where: { id } }).then((service) => {
      if (!service) throw new NotFoundException('Service not found');
      return service;
    });
  }

  async create(dto: CreateServiceDto) {
    try {
      return await this.prisma.service.create({
        data: {
          name: dto.name.trim(),
          slug: dto.slug.trim().toLowerCase(),
          shortDescription: dto.shortDescription.trim(),
          description: dto.description.trim(),
          icon: dto.icon.trim(),
          sortOrder: dto.sortOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      this.mapError(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.get(id);
    try {
      return await this.prisma.service.update({
        where: { id },
        data: this.toData(dto),
      });
    } catch (error) {
      this.mapError(error);
      throw error;
    }
  }

  async remove(id: string) {
    await this.get(id);
    await this.prisma.service.delete({ where: { id } });
  }

  private toData(dto: CreateServiceDto | UpdateServiceDto) {
    return {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.slug !== undefined
        ? { slug: dto.slug.trim().toLowerCase() }
        : {}),
      ...(dto.shortDescription !== undefined
        ? { shortDescription: dto.shortDescription.trim() }
        : {}),
      ...(dto.description !== undefined
        ? { description: dto.description.trim() }
        : {}),
      ...(dto.icon !== undefined ? { icon: dto.icon.trim() } : {}),
      ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    };
  }

  private mapError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('A service with this slug already exists');
    }
  }
}
