import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class UploadsQueueService {
  constructor(
    @InjectQueue('thumbnails') private readonly thumbnailsQueue: Queue,
  ) {}

  async enqueueThumbnailJob(params: { filename: string; path: string }) {
    const job = await this.thumbnailsQueue.add('generate-thumbnail', params, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
    return job.id;
  }
  async getJobStatus(jobId: string) {
    const job = await this.thumbnailsQueue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();

    const statusMap: Record<string, string> = {
      waiting: 'queued',
      delayed: 'queued',
      active: 'processing',
      completed: 'done',
      failed: 'failed',
    };

    return {
      jobId: job.id,
      status: statusMap[state] ?? state,
    };
  }
}
