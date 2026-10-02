import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorkspaceService } from '../workspace/workspace.service.js';
import { DocumentStorage } from './storage/document-storage.js';

const allowedTypes = new Map([
  ['.pdf', 'application/pdf'],
  ['.doc', 'application/msword'],
  [
    '.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ['.txt', 'text/plain'],
]);

export type UploadedDocument = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaces: WorkspaceService,
    private readonly storage: DocumentStorage,
  ) {}

  async list(workspaceId: string, userId: string, projectId?: string) {
    await this.workspaces.assertMember(workspaceId, userId);
    return this.prisma.document.findMany({
      where: { workspaceId, projectId: projectId ?? null },
      select: this.metadataSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(workspaceId: string, documentId: string, userId: string) {
    await this.workspaces.assertMember(workspaceId, userId);
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, workspaceId },
      select: this.metadataSelect,
    });
    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

  async upload(
    workspaceId: string,
    userId: string,
    file: UploadedDocument | undefined,
    projectId?: string,
  ) {
    await this.workspaces.assertMember(workspaceId, userId);
    this.validateFile(file);
    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, workspaceId },
        select: { id: true },
      });
      if (!project) throw new BadRequestException('Project does not belong to this workspace');
    }

    const extension = extname(file.originalname).toLowerCase();
    const documentId = randomUUID();
    const storedName = `${documentId}${extension}`;
    const storageKey = [
      'documents',
      workspaceId,
      ...(projectId ? [projectId] : []),
      storedName,
    ].join('/');

    await this.storage.save(storageKey, file.buffer);
    try {
      return await this.prisma.document.create({
        data: {
          id: documentId,
          workspaceId,
          projectId,
          uploadedById: userId,
          originalName: file.originalname,
          storedName,
          mimeType: file.mimetype,
          size: file.size,
          storageKey,
        },
        select: this.metadataSelect,
      });
    } catch (error) {
      await this.storage.delete(storageKey);
      throw error;
    }
  }

  async download(workspaceId: string, documentId: string, userId: string) {
    const document = await this.getInternal(workspaceId, documentId, userId);
    if (!(await this.storage.exists(document.storageKey))) {
      throw new NotFoundException('Document file not found');
    }
    return { document, stream: this.storage.read(document.storageKey) };
  }

  async remove(workspaceId: string, documentId: string, userId: string) {
    const document = await this.getInternal(workspaceId, documentId, userId);
    try {
      await this.storage.delete(document.storageKey);
    } catch {
      throw new InternalServerErrorException(
        'The stored file could not be deleted, so document metadata was preserved',
      );
    }
    await this.prisma.document.delete({ where: { id: document.id } });
  }

  private async getInternal(workspaceId: string, documentId: string, userId: string) {
    await this.workspaces.assertMember(workspaceId, userId);
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, workspaceId },
      select: { ...this.metadataSelect, storageKey: true },
    });
    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

  private validateFile(file: UploadedDocument | undefined): asserts file is UploadedDocument {
    if (!file) throw new BadRequestException('Please upload a document file.');
    if (file.size <= 0 || file.buffer.length === 0) {
      throw new BadRequestException('The uploaded document is empty.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Documents must be 10 MB or smaller.');
    }
    const extension = extname(file.originalname).toLowerCase();
    if (allowedTypes.get(extension) !== file.mimetype) {
      throw new BadRequestException('Only PDF, DOC, DOCX, and TXT files are supported.');
    }
  }

  private readonly metadataSelect = {
    id: true,
    originalName: true,
    mimeType: true,
    size: true,
    createdAt: true,
    updatedAt: true,
    uploadedBy: { select: { id: true, name: true, email: true } },
    project: { select: { id: true, name: true } },
  } as const;
}
