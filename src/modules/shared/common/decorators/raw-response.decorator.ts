import { SetMetadata } from '@nestjs/common';

// Marks a route handler to skip ResponseTransformInterceptor's
// { success, data } wrapping — for endpoints (e.g. health checks) whose
// response shape is dictated by an external contract we don't control.
export const RAW_RESPONSE_KEY = 'rawResponse';
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true);
