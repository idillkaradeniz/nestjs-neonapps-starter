import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_TOKENS } from '../shared/database/database.tokens';
import * as schema from '../shared/database/schema';
import { ticketComments } from '../shared/database/schema/ticket-comment.schema';
import { NewTicketCommentRow } from './interfaces/new-ticket-comment-row.type';
import { TicketCommentRow } from './interfaces/ticket-comment-row.type';

@Injectable()
export class TicketCommentRepository {
  constructor(
    @Inject(DATABASE_TOKENS.DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: NewTicketCommentRow): Promise<TicketCommentRow> {
    const [comment] = await this.db
      .insert(ticketComments)
      .values(data)
      .returning();
    if (!comment) {
      throw new Error('Insert returned no row');
    }
    return comment;
  }

  async findAllByTicketId(
    ticketId: string,
    page: number,
    limit: number,
  ): Promise<TicketCommentRow[]> {
    return this.db
      .select()
      .from(ticketComments)
      .where(eq(ticketComments.ticketId, ticketId))
      .limit(limit)
      .offset((page - 1) * limit);
  }
}
