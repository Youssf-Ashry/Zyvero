import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, normalize, relative } from 'node:path';
import { DocumentStorage } from './document-storage.js';

@Injectable()
export class LocalDocumentStorageService extends DocumentStorage {
  private readonly root = join(process.cwd(), 'uploads');

  async save(storageKey: string, data: Buffer) {
    const absolutePath = this.resolve(storageKey);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, data, { flag: 'wx' });
  }

  async delete(storageKey: string) {
    await rm(this.resolve(storageKey), { force: true });
  }

  async exists(storageKey: string) {
    try {
      await stat(this.resolve(storageKey));
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
      throw new InternalServerErrorException('Unable to access document storage');
    }
  }

  read(storageKey: string) {
    return createReadStream(this.resolve(storageKey));
  }

  private resolve(storageKey: string) {
    if (isAbsolute(storageKey) || storageKey.split(/[\\/]/).includes('..')) {
      throw new BadRequestException('Invalid document storage key');
    }
    const absolutePath = normalize(join(this.root, storageKey));
    const relativePath = relative(this.root, absolutePath);
    if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
      throw new BadRequestException('Invalid document storage key');
    }
    return absolutePath;
  }
}
