import { refreshTokens } from '../../shared/database/schema/refresh-token.schema';

// Row type derived from the schema — never hand-write this. Mirrors
// UserRow's pattern (user-row.type.ts).
export type RefreshTokenRow = typeof refreshTokens.$inferSelect;
