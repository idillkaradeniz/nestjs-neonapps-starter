import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Env } from '../config/env.schema';
import { DATABASE_TOKENS } from './database.tokens';
import * as schema from './schema';

// Global module: builds the pg Pool + Drizzle instance ONCE, exposes it
// through a DI token. No other file constructs a Pool or calls
// drizzle() — this is the only room with a door to the vault.
@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKENS.DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) => {
        const pool = new Pool({
          connectionString: configService.get('DATABASE_URL', { infer: true }),
        });
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DATABASE_TOKENS.DRIZZLE],
})
export class DatabaseModule {}
