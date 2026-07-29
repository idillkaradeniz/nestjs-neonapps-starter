// The result of analyzing an exception inside HttpExceptionFilter —
// the status/code/message/details actually sent to the client.
export interface NormalizedError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
