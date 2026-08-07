import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_TOKENS } from '../../shared/database/database.tokens';
import * as schema from '../../shared/database/schema';
import { RedisService } from '../../shared/redis/redis.service';

// Day 12: every 5 minutes, pings DB + Redis and logs a one-line status.
// Each ping is independently try/catch'd — one being down must not stop
// us from reporting the other's status.
@Injectable()
export class HealthSnapshotJob {
  private readonly logger = new Logger(HealthSnapshotJob.name);

  constructor(
    @Inject(DATABASE_TOKENS.DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly redisService: RedisService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleHealthSnapshot(): Promise<void> {
    // void-ok — cron job, no caller awaits the result

    const dbStatus = await this.pingDb();
    const redisStatus = await this.pingRedis();
    this.logger.log(`Health snapshot — db: ${dbStatus}, redis: ${redisStatus}`);
  }

  private async pingDb(): Promise<'up' | 'down'> {
    try {
      await this.db.execute(sql`select 1`);
      return 'up';
    } catch {
      return 'down';
    }
  }

  private async pingRedis(): Promise<'up' | 'down'> {
    try {
      await this.redisService.ping();
      return 'up';
    } catch {
      return 'down';
    }
  }
}
