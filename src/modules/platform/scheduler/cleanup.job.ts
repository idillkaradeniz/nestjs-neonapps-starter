import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserService } from '../../user/users/user.service';

// Day 12: nightly hard-delete of users soft-deleted (isActive: false)
// more than 30 days ago. Runs through UserService, same as any other
// caller — see UserService.purgeInactiveOlderThan for why.
@Injectable()
export class CleanupJob {
  private readonly logger = new Logger(CleanupJob.name);

  constructor(private readonly userService: UserService) {}

  // Cron syntax: "minute hour day-of-month month day-of-week"
  // '0 3 * * *' = minute 0, hour 3, every day, every month, every weekday
  // → runs once, at 03:00, every night.
  @Cron('0 3 * * *')
  async handleCleanup(): Promise<void> {
    // void-ok — cron job, no caller awaits the result
    const deleted = await this.userService.purgeInactiveOlderThan(30);
    this.logger.log(
      `Cleanup job: purged ${deleted} inactive user(s) older than 30 days`,
    );
  }
}
