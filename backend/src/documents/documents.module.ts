import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { DocumentStorage } from './storage/document-storage.js';
import { LocalDocumentStorageService } from './storage/local-document-storage.service.js';

@Module({
  imports: [AuthModule, WorkspaceModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    LocalDocumentStorageService,
    { provide: DocumentStorage, useExisting: LocalDocumentStorageService },
  ],
})
export class DocumentsModule {}
