import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async createInquiry(dto: CreateContactDto) {
    try {
      return await this.prisma.contactInquiry.create({
        data: {
          name: dto.name,
          email: dto.email,
          subject: dto.subject,
          message: dto.message,
        },
      });
    } catch {
      throw new InternalServerErrorException(
        'Unable to submit contact inquiry.',
      );
    }
  }
}
