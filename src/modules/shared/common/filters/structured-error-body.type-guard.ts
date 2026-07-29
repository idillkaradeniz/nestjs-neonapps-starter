import { StructuredErrorBody } from './structured-error-body.interface';

export const isStructuredErrorBody = (
  body: unknown,
): body is StructuredErrorBody => {
  return (
    typeof body === 'object' &&
    body !== null &&
    'code' in body &&
    'message' in body
  );
};
