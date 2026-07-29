// The response body shape our own code writes onto Nest's HttpException
// (e.g. validationExceptionFactory) — when HttpExceptionFilter finds a
// body already in this shape, it uses it as-is instead of falling back
// to a generic HTTP_ERROR code.
export interface StructuredErrorBody {
  code: string;
  message: string;
  // boundary: validated — arbitrary structured payload attached by whoever built this exception body.
  details?: Record<string, unknown>;
}
