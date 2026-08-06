import { ApiProperty } from '@nestjs/swagger';

// Mirrors HttpExceptionFilter's error shape exactly — this is what
// Swagger shows for every failed request, regardless of which domain
// error actually fired (see ApiErrorCodes for the per-endpoint list).
class ErrorDetail {
  @ApiProperty({ example: 'AUTH_INVALID_CREDENTIALS' })
  code: string;

  @ApiProperty({ example: 'Invalid email or password' })
  message: string;

  @ApiProperty({ required: false, type: Object })
  details?: Record<string, unknown>;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: false;

  @ApiProperty({ type: ErrorDetail })
  error: ErrorDetail;
}
