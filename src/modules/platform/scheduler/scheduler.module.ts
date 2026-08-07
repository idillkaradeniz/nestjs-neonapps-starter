import { Module } from '@nestjs/common';
import { UsersModule } from '../../user/users/users.module';
import { CleanupJob } from './cleanup.job';
import { HealthSnapshotJob } from './health-snapshot.job';

// Groups both cron jobs. UsersModule imported for UserService (cleanup
// job); DRIZZLE token and RedisService are injectable without an import
// since DatabaseModule and RedisModule are both @Global().
@Module({
  imports: [UsersModule],
  providers: [CleanupJob, HealthSnapshotJob],
})
export class SchedulerModule {}
