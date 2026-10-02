import type { ReadStream } from 'node:fs';

export abstract class DocumentStorage {
  abstract save(storageKey: string, data: Buffer): Promise<void>;
  abstract delete(storageKey: string): Promise<void>;
  abstract exists(storageKey: string): Promise<boolean>;
  abstract read(storageKey: string): ReadStream;
}
