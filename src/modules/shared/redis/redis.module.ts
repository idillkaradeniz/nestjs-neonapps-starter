import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Env } from '../config/env.schema';
import { REDIS_TOKENS } from './redis.tokens';

// Global module: builds the ioredis client ONCE, exposes it through a DI
// token. Used today for the login rate-limit counter (Day 7 bonus/teaser
// for Day 10's proper rate-limiting pass).
@Global()
@Module({
  providers: [
    {
      provide: REDIS_TOKENS.CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) => {
        return new Redis(configService.get('REDIS_URL', { infer: true }));
      },
    },
  ],
  exports: [REDIS_TOKENS.CLIENT],
})
export class RedisModule {}
