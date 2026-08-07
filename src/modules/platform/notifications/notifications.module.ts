import { Module } from '@nestjs/common';
import { WelcomeEmailListener } from './welcome-email.listener';

@Module({
  providers: [WelcomeEmailListener],
})
export class NotificationsModule {}
