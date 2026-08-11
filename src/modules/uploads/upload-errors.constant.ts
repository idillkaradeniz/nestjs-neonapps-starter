import { DomainException } from '../shared/common/errors/domain.exception';
import { ErrorCodeDefinition } from '../shared/common/errors/error-code-definition.interface';
import { UploadErrorCode } from './upload-error-code.enum';

export const UPLOAD_ERRORS: Record<UploadErrorCode, ErrorCodeDefinition> = {
  [UploadErrorCode.FILE_TOO_LARGE]: {
    code: UploadErrorCode.FILE_TOO_LARGE,
    status: 413,
    message: 'File exceeds the maximum allowed size of {maxSizeMb}MB',
  },
  [UploadErrorCode.UNSUPPORTED_TYPE]: {
    code: UploadErrorCode.UNSUPPORTED_TYPE,
    status: 415,
    message: 'File type {mimetype} is not supported',
  },
  [UploadErrorCode.NOT_FOUND]: {
    code: UploadErrorCode.NOT_FOUND,
    status: 404,
    message: 'Upload {id} not found',
  },
};

export const UploadErrors = {
  fileTooLarge: (params: {maxSizeMb: number}) =>
    new DomainException(UPLOAD_ERRORS[UploadErrorCode.FILE_TOO_LARGE], params),
  unsupportedType: (params: { mimetype: string }) =>
  new DomainException(UPLOAD_ERRORS[UploadErrorCode.UNSUPPORTED_TYPE], params),
  notFound: (params: {id: string}) =>
    new DomainException(UPLOAD_ERRORS[UploadErrorCode.NOT_FOUND], params),
};

// Business rule (Day 14): what counts as an acceptable upload. Enforced
// at the gate (multer config below) — never in a downstream processor.
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
