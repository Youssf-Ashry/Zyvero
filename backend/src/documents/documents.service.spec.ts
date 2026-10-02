import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DocumentsService } from './documents.service.js';
import { DocumentStorage } from './storage/document-storage.js';
import { LocalDocumentStorageService } from './storage/local-document-storage.service.js';

const file = (overrides: Partial<Express.Multer.File> = {}) => ({
  originalname: 'guide.pdf',
  mimetype: 'application/pdf',
  size: 4,
  buffer: Buffer.from('test'),
  ...overrides,
});

const createService = () => {
  const prisma = {
    document: {
      create: vi.fn().mockResolvedValue({ id: 'document-id' }),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      delete: vi.fn().mockResolvedValue({ id: 'document-id' }),
    },
    project: {
      findFirst: vi.fn(),
    },
  };
  const workspaces = {
    assertMember: vi.fn().mockResolvedValue(undefined),
  };
  const storage = {
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  } as unknown as DocumentStorage;
  return {
    service: new DocumentsService(prisma as never, workspaces as never, storage),
    prisma,
    workspaces,
    storage,
  };
};

describe('DocumentsService', () => {
  it('rejects missing, empty, unsupported, and oversized files', async () => {
    const cases = [
      [undefined, 'Please upload a document file.'],
      [file({ size: 0, buffer: Buffer.alloc(0) }), 'The uploaded document is empty.'],
      [file({ originalname: 'guide.exe', mimetype: 'application/octet-stream' }), 'Only PDF'],
      [file({ size: 10 * 1024 * 1024 + 1 }), 'Documents must be 10 MB'],
    ] as const;

    for (const [uploadedFile, message] of cases) {
      const { service } = createService();
      await expect(
        service.upload('workspace-id', 'user-id', uploadedFile),
      ).rejects.toThrow(message);
    }
  });

  it('rejects a project from another workspace before storing the file', async () => {
    const { service, prisma, storage } = createService();
    prisma.project.findFirst.mockResolvedValue(null);

    await expect(
      service.upload('workspace-a', 'user-id', file(), 'project-b'),
    ).rejects.toThrow('Project does not belong to this workspace');
    expect(storage.save).not.toHaveBeenCalled();
  });

  it('keeps workspace and project document listings isolated', async () => {
    const { service, prisma } = createService();

    await service.list('workspace-id', 'user-id');
    expect(prisma.document.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { workspaceId: 'workspace-id', projectId: null } }),
    );

    await service.list('workspace-id', 'user-id', 'project-id');
    expect(prisma.document.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { workspaceId: 'workspace-id', projectId: 'project-id' },
      }),
    );
  });

  it('preserves metadata when physical deletion fails', async () => {
    const { service, prisma, storage } = createService();
    prisma.document.findFirst.mockResolvedValue({
      id: 'document-id',
      storageKey: 'documents/workspace-id/document-id.pdf',
      originalName: 'guide.pdf',
      mimeType: 'application/pdf',
      size: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      uploadedBy: { id: 'user-id', name: 'User', email: 'user@example.com' },
      project: null,
    });
    vi.mocked(storage.delete).mockRejectedValue(new Error('storage unavailable'));

    await expect(service.remove('workspace-id', 'document-id', 'user-id')).rejects.toThrow(
      'metadata was preserved',
    );
    expect(prisma.document.delete).not.toHaveBeenCalled();
  });

  it('removes stored bytes when metadata persistence fails', async () => {
    const { service, prisma, storage } = createService();
    prisma.document.create.mockRejectedValue(new Error('database unavailable'));

    await expect(
      service.upload('workspace-id', 'user-id', file()),
    ).rejects.toThrow('database unavailable');
    expect(storage.save).toHaveBeenCalledOnce();
    expect(storage.delete).toHaveBeenCalledWith(expect.stringContaining('documents/workspace-id/'));
  });

  it('uses generated document storage keys and rejects traversal', async () => {
    const storage = new LocalDocumentStorageService();
    await expect(storage.save('../outside.txt', Buffer.from('x'))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
