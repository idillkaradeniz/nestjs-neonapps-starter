import { HttpException } from '@nestjs/common';
import { ErrorCodeDefinition } from './error-code-definition.interface';
import { formatMessage } from './message-formatter';

// The ONE exception class for every domain/business error — no
// class-per-error-type zoo. It carries a catalog `definition` (code,
// status, message template) plus the `params` used to fill that
// template. Extends HttpException so Nest's HTTP layer already knows
// how to turn it into a response with the right status code.
export class DomainException extends HttpException {
  definition: ErrorCodeDefinition;
  params?: Record<string, string | number>;

  constructor(
    definition: ErrorCodeDefinition,
    params?: Record<string, string | number>,
  ) {
    super(formatMessage(definition.message, params ?? {}), definition.status);
    this.definition = definition;
    this.params = params;
  }
}
