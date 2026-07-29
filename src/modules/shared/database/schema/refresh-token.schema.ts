import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

// One row per active refresh token. `id` doubles as the JWT `jti` claim
// (RefreshTokenService looks a row up by id, THEN bcrypt-compares the
// raw token against tokenHash — id gives a fast, indexed lookup since
// you cannot query "WHERE hash = bcrypt(x)", bcrypt hashes aren't
// searchable that way). Rotation = delete this row and insert a new
// one; reusing an already-rotated token finds no row and fails closed.
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
});
