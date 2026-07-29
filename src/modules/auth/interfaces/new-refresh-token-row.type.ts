import { refreshTokens } from '../../shared/database/schema/refresh-token.schema';

// Row type derived from the schema — never hand-write this. Mirrors
// NewUserRow's pattern (new-user-row.type.ts).
export type NewRefreshTokenRow = typeof refreshTokens.$inferInsert;
