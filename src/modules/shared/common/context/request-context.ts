import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContextStore {
  requestId?: string;
  userId?: string;
  auditBefore?: Record<string, unknown> | null;
}

// Single, app-wide AsyncLocalStorage instance. The middleware "runs" it
// at the start of every request; any code downstream — service,
// repository, strategy, doesn't matter how deep — can read from it via
// getStore() without needing the value passed in as a parameter.
export const requestContext = new AsyncLocalStorage<RequestContextStore>();
