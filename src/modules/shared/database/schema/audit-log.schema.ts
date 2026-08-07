import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';

// Append-only evidence table (Day 13). No update/delete path is ever
// exposed for this table (see AuditService/AuditRepository) — audit
// rows can only be created and read. before/after are typed jsonb
// (.$type<...>()) so a snapshot can never silently decay into `any`.
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    action: varchar('action', { length: 50 }).notNull(),
    entity: varchar('entity', { length: 100 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    before: jsonb('before').$type<Record<string, unknown> | null>(),
    after: jsonb('after').$type<Record<string, unknown> | null>(),
    performedBy: uuid('performed_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  // Composite index matches how we'll actually query: by entity
  // (viewer filters "show me all changes to X"), and by actor+time
  // (viewer filters "show me what user Y did, in order").
  (t) => [
    index('audit_entity_idx').on(t.entity),
    index('audit_actor_time_idx').on(t.performedBy, t.createdAt),
  ],
);
