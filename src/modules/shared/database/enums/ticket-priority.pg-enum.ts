import { pgEnum } from 'drizzle-orm/pg-core';

export const ticketPriorityEnum = pgEnum('ticket_priority', [
  'LOW',
  'MEDIUM',
  'HIGH',
]);
