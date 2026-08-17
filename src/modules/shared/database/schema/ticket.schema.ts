import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { ticketStatusEnum, ticketPriorityEnum } from '../enums';

export const tickets = pgTable(
  'tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    status: ticketStatusEnum('status').notNull().default('OPEN'),
    priority: ticketPriorityEnum('priority').notNull().default('MEDIUM'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    assignedTo: uuid('assigned_to').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    closedAt: timestamp('closed_at', { withTimezone: true, mode: 'date' }),
  },
  (t) => [
    index('tickets_created_by_status_idx').on(t.createdBy, t.status),
    index('tickets_assigned_to_idx').on(t.assignedTo),
  ],
);
