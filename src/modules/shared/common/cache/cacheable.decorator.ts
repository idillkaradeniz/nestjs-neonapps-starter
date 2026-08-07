import { SetMetadata } from '@nestjs/common';
import type { Request } from 'express';
import { CACHEABLE_METADATA_KEY } from './cache.constants';

export interface CacheableOptions {
  /** Seconds before the cached entry expires. */
  ttl: number;
  /** Fixed key — only safe for handlers that take NO arguments. */
  key?: string;
  /**
   * Builds the key from the request — MANDATORY for any handler that
   * reads params/query (userId, filters, pagination). One shared key
   * across different inputs means user B gets user A's cached result —
   * this is the one rule the interceptor enforces, not just documents.
   */
  keyFn?: (req: Request) => string;
}

export const Cacheable = (options: CacheableOptions): MethodDecorator =>
  SetMetadata(CACHEABLE_METADATA_KEY, options);
