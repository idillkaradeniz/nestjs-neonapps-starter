import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';
import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from './uploads.constants';
import { UploadErrors } from './upload-errors.constant';
import { UploadsQueueService } from './uploads-queue.service';
// The "gate": a disciplined entry point for file uploads. Two rules are
// enforced HERE, not downstream — size (multer's `limits`, aborts the
// stream early, never buffers an oversize file) and type (`fileFilter`,
// checked before the file is even written to disk).
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsQueueService: UploadsQueueService) {}
  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    const status = await this.uploadsQueueService.getJobStatus(id);

    if (!status) {
      throw UploadErrors.notFound({ id });
    }

    return status;
  }
  @Post()
  @HttpCode(202)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        // Never the client's own filename — a client could send
        // "../../etc/passwd" or a name colliding with another user's
        // file. A random name removes both the path-traversal risk and
        // any possibility of collision, and carries no information
        // about who uploaded what.
        filename: (_req, file, cb) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(UploadErrors.unsupportedType({ mimetype: file.mimetype }), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    const jobId = await this.uploadsQueueService.enqueueThumbnailJob({
      filename: file.filename,
      path: file.path,
    });

    return {
      jobId,
      filename: file.filename,
      status: 'queued',
    };
  }
}
