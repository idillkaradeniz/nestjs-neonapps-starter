import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { BullModule } from '@nestjs/bullmq';
import { UploadsQueueService } from './uploads-queue.service';
import { ThumbnailsProcessor } from './thumbnails.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'thumbnails' })],
  controllers: [UploadsController],
  providers: [UploadsQueueService, ThumbnailsProcessor],
})
export class UploadsModule {}
