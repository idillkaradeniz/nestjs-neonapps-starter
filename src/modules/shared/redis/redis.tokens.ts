// DI token for the Redis client — same rationale as DATABASE_TOKENS:
// exactly one place constructs the client, everyone else injects it.
export const REDIS_TOKENS = {
  CLIENT: Symbol('REDIS_CLIENT'),
} as const;
