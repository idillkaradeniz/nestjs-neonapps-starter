// DI token for the Drizzle connection. We inject the connection through
// this token rather than importing a client directly so it can be
// swapped for a test double in unit tests, and so there is exactly ONE
// place that knows how the connection is constructed.
export const DATABASE_TOKENS = {
  DRIZZLE: Symbol('DRIZZLE_CONNECTION'),
} as const;
