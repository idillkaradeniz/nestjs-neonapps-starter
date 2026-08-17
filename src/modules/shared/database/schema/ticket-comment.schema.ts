import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { tickets } from './ticket.schema';

export const ticketComments = pgTable(
  'ticket_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => tickets.id),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('ticket_comments_ticket_id_idx').on(t.ticketId)],
);
