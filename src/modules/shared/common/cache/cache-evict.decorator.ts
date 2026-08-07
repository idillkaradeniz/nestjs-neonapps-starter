import { SetMetadata } from '@nestjs/common';
import type { Request } from 'express';
import { CACHE_EVICT_METADATA_KEY } from './cache.constants';

export interface CacheEvictOptions {
  /**
   * Builds the exact entity key to remove. Receives both the request
   * (for update/delete, where the id is in req.params) and the
   * handler's own response data (for create, where the id doesn't
   * exist until the DB assigns it).
   */
  keyFn: (req: Request, data: unknown) => string;
  /**
   * Optional: also wipe every cached list for this entity (e.g.
   * "user:list") since a write can change which rows belong in any
   * page/filter combination — we can't cheaply know which hashed list
   * keys are now stale, so we clear them all.
   */
  listPrefix?: string;
}

export const CacheEvict = (options: CacheEvictOptions): MethodDecorator =>
  SetMetadata(CACHE_EVICT_METADATA_KEY, options);
