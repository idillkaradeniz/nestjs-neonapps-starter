import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_TOKENS } from '../shared/database/database.tokens';
import * as schema from '../shared/database/schema';
import { tickets } from '../shared/database/schema/ticket.schema';
import { NewTicketRow } from './interfaces/new-ticket-row.type';
import { TicketRow } from './interfaces/ticket-row.type';

@Injectable()
export class TicketRepository {
  constructor(
    @Inject(DATABASE_TOKENS.DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: NewTicketRow): Promise<TicketRow> {
    const [ticket] = await this.db.insert(tickets).values(data).returning();
    if (!ticket) {
      throw new Error('Insert returned no row');
    }
    return ticket;
  }

  async findOne(id: string): Promise<TicketRow | undefined> {
    const [ticket] = await this.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id)).limit(1)
    return ticket;
  }

  async findAll(
  filters: { createdBy?: string; assignedTo?: string },
  page: number,
  limit: number,
): Promise<TicketRow[]> {
  const conditions = [];
  if (filters.createdBy) conditions.push(eq(tickets.createdBy, filters.createdBy));
  if (filters.assignedTo) conditions.push(eq(tickets.assignedTo, filters.assignedTo));

  return this.db
    .select()
    .from(tickets)
    .where(conditions.length ? and(...conditions) : undefined)
    .limit(limit)
    .offset((page - 1) * limit);
}

  async update(
    id: string,
    changes: Partial<Pick<TicketRow, 'title' | 'description' | 'priority' | 'status' | 'assignedTo' | 'closedAt'>>,
  ): Promise<TicketRow | undefined> {
    const [ticket] = await this.db
      .update(tickets)
      .set({ ...changes, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  // Business rule #2 (open ticket limit) needs this count.
  async countOpenByUser(userId: string): Promise<number> {
    const rows = await this.db
      .select()
      .from(tickets)
      .where(
        and(
          eq(tickets.createdBy, userId),
          inArray(tickets.status, ['OPEN', 'IN_PROGRESS']),
        ),
      );
    return rows.length;
  }
}
