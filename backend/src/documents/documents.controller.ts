import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { Permission, RequirePermissions } from '../auth/workspace-permission.js';
import { WorkspacePermissionGuard } from '../auth/workspace-permission.guard.js';
import { DocumentsService } from './documents.service.js';

@Controller('workspaces/:workspaceId/documents')
@UseGuards(AuthGuard, WorkspacePermissionGuard)
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  @RequirePermissions(Permission.KNOWLEDGE_VIEW)
  list(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.documents.list(workspaceId, user.id, projectId);
  }

  @Post()
  @RequirePermissions(Permission.KNOWLEDGE_CREATE)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  upload(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('projectId') projectId?: string,
  ) {
    return this.documents.upload(workspaceId, user.id, file, projectId);
  }

  @Get(':id')
  @RequirePermissions(Permission.KNOWLEDGE_VIEW)
  get(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.documents.get(workspaceId, id, user.id);
  }

  @Get(':id/download')
  @RequirePermissions(Permission.KNOWLEDGE_VIEW)
  async download(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    const { document, stream } = await this.documents.download(workspaceId, id, user.id);
    const safeName = document.originalName.replace(/[\r\n"]/g, '_');
    response.setHeader('Content-Type', document.mimeType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(document.originalName)}`,
    );
    stream.on('error', () => {
      if (!response.headersSent) response.status(HttpStatus.NOT_FOUND).json({ message: 'Document file not found' });
      else response.destroy();
    });
    stream.pipe(response);
  }

  @Delete(':id')
  @RequirePermissions(Permission.KNOWLEDGE_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    await this.documents.remove(workspaceId, id, user.id);
  }
}
