import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

// Flattens class-validator's nested ValidationError tree into a flat
// { dottedPath: messages[] } map — e.g. a failure on a nested
// `address.city` field becomes the key "address.city", matching how
// you'd address that field in JS (obj.address.city).
function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): Record<string, string[]> {
  const details: Record<string, string[]> = {};

  for (const error of errors) {
    const path = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      details[path] = Object.values(error.constraints);
    }

    if (error.children && error.children.length > 0) {
      Object.assign(details, flattenValidationErrors(error.children, path));
    }
  }

  return details;
}

// Wired into ValidationPipe's `exceptionFactory` option. Instead of
// Nest's default { statusCode, message: string[], error } shape, this
// throws a BadRequestException whose body already matches our Day 5
// envelope's error shape — HttpExceptionFilter picks it up as-is, so
// the client always gets { success: false, error: { code, message,
// details } } with per-field, dotted-path errors in `details`.
export function validationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  return new BadRequestException({
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details: flattenValidationErrors(errors),
  });
}
