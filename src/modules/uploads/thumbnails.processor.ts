import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('thumbnails')
export class ThumbnailsProcessor extends WorkerHost {
  private readonly logger = new Logger(ThumbnailsProcessor.name);

  async process(job: Job<{ filename: string; path: string }>): Promise<void> {
    // void-ok: BullMQ job processor, no meaningful return value expected
    this.logger.log(
      `Processing thumbnail job ${job.id} for ${job.data.filename}`,
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.logger.log(`Thumbnail job ${job.id} completed`);
  }
  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
      this.logger.error(
        `Thumbnail job ${job.id} failed permanently after ${job.attemptsMade} attempts: ${error.message}`,
      );
    }
  }
}
