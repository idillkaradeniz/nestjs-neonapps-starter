import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_TOKENS } from './redis.tokens';

// Thin wrapper around the raw ioredis client — same rationale as every
// other repository/service in this codebase: exactly one place knows
// about the underlying client's exact method signatures, everyone else
// depends on this narrow, purpose-built interface instead.
@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_TOKENS.CLIENT) private readonly client: Redis) {}

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  // "EX seconds" sets the key's value AND its TTL in one ioredis call —
  // ioredis translates this into a single Redis SET command with the
  // EX option, not two separate round trips.
  async setWithExpirySeconds(
    key: string,
    value: string,
    seconds: number,
  ): Promise<void> {
    // void-ok
    await this.client.set(key, value, 'EX', seconds);
  }

  async del(key: string): Promise<void> {
    // void-ok
    await this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    // void-ok
    await this.client.expire(key, seconds);
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  // Used by cache invalidation: when an entity changes, we can't know
  // every hashed list-cache key that might contain it (page=1, page=2,
  // different filters...), so instead of tracking them all, we just wipe
  // every "entity:list:*" key in one sweep. SCAN (not KEYS) because KEYS
  // blocks the whole Redis instance on a large keyspace — SCAN walks it
  // in small non-blocking chunks instead.
  async deleteByPattern(pattern: string): Promise<void> {
    // void-ok
    const stream = this.client.scanStream({ match: pattern, count: 100 });
    const pipeline = this.client.pipeline();
    let found = false;
    for await (const keys of stream as AsyncIterable<string[]>) {
      if (keys.length > 0) {
        found = true;
        for (const key of keys) {
          pipeline.del(key);
        }
      }
    }
    if (found) {
      await pipeline.exec();
    }
  }
}
