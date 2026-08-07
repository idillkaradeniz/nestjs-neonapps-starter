import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RedisService } from '../../redis/redis.service';
import { CacheableOptions } from './cacheable.decorator';
import { CacheEvictOptions } from './cache-evict.decorator';
import {
  CACHEABLE_METADATA_KEY,
  CACHE_EVICT_METADATA_KEY,
} from './cache.constants';
import { wrapCacheMeta } from './cache-envelope.interface';

interface StoredCacheEntry {
  data: unknown;
  cachedAt: string;
}

// Global interceptor (see main.ts for registration order — it MUST sit
// closer to the handler than ResponseTransformInterceptor, so it caches
// the raw result, not the { success, data } envelope; see "why order
// matters" in the task notes).
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly redis: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const handler = context.getHandler();

    const evictOptions = this.reflector.get<CacheEvictOptions | undefined>(
      CACHE_EVICT_METADATA_KEY,
      handler,
    );
    if (evictOptions) {
      return next.handle().pipe(
        tap((data) => {
          void this.evict(context, evictOptions, data);
        }),
      );
    }
    const cacheableOptions = this.reflector.get<CacheableOptions | undefined>(
      CACHEABLE_METADATA_KEY,
      handler,
    );
    if (!cacheableOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const isParameterized =
      Object.keys(request.params ?? {}).length > 0 ||
      Object.keys((request.query as object) ?? {}).length > 0;

    // The iron rule: a parameterized handler with no keyFn would cache
    // under one shared key for every caller — user B would receive
    // user A's data. Refuse to cache rather than risk that.
    if (isParameterized && !cacheableOptions.keyFn) {
      this.logger.warn(
        `@Cacheable on ${String(handler.name)} takes params/query but has no keyFn — skipping cache to avoid a cross-user data leak.`,
      );
      return next.handle();
    }

    const key = cacheableOptions.keyFn
      ? cacheableOptions.keyFn(request)
      : cacheableOptions.key;
    if (!key) {
      this.logger.warn(
        `@Cacheable on ${String(handler.name)} produced no cache key — skipping cache.`,
      );
      return next.handle();
    }

    try {
      const cached = await this.redis.get(key);
      if (cached) {
        const parsed = JSON.parse(cached) as StoredCacheEntry;
        return of(wrapCacheMeta(parsed.data, true, parsed.cachedAt));
      }
    } catch (err) {
      // Graceful degradation: a cache outage must never become a 500.
      // Log and fall through to the real handler below.
      this.logger.warn(
        `Redis unavailable, falling back to DB for key "${key}": ${(err as Error).message}`,
      );
    }

    const cachedAt = new Date().toISOString();
    return next.handle().pipe(
      tap((data) => {
        void this.store(key, data, cachedAt, cacheableOptions.ttl);
      }),
      map((data) => wrapCacheMeta(data, false, cachedAt)),
    );
  }

  private async store(
    key: string,
    data: unknown,
    cachedAt: string,
    ttl: number,
  ): Promise<void> {
    // void-ok
    try {
      const entry: StoredCacheEntry = { data, cachedAt };
      await this.redis.setWithExpirySeconds(key, JSON.stringify(entry), ttl);
    } catch (err) {
      this.logger.warn(
        `Redis unavailable, could not cache key "${key}": ${(err as Error).message}`,
      );
    }
  }

  private async evict(
    context: ExecutionContext,
    options: CacheEvictOptions,
    data: unknown,
  ): Promise<void> {
    // void-ok
    const request = context.switchToHttp().getRequest<Request>();
    const key = options.keyFn(request, data);
    try {
      await this.redis.del(key);
      if (options.listPrefix) {
        await this.redis.deleteByPattern(`${options.listPrefix}:*`);
      }
    } catch (err) {
      this.logger.warn(
        `Redis unavailable, could not evict key "${key}": ${(err as Error).message}`,
      );
    }
  }
}
