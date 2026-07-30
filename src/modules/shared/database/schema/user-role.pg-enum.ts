import { pgEnum } from 'drizzle-orm/pg-core';

// Postgres native enum — chose this over text+CHECK because the role
// list is expected to stay stable long-term. Trade-off accepted: adding
// a value later is easy (ALTER TYPE ... ADD VALUE), but removing or
// reordering one after data exists needs a proper migration (new enum
// type + cast + swap), not a one-liner.
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'USER', 'MODERATOR']);
