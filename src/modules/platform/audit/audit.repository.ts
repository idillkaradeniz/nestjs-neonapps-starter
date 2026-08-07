import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte, lte, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_TOKENS } from '../../shared/database/database.tokens';
import * as schema from '../../shared/database/schema';
import { auditLogs } from '../../shared/database/schema/audit-log.schema';
import { AuditQueryFilter } from './interfaces/audit-query-filter.interface';
import { AuditRow, NewAuditRow } from './interfaces/audit-row.type';

// Append-only by design: create + read only. No update(), no delete() —
// evidence you can edit isn't evidence (see the Day 13 brief).
@Injectable()
export class AuditRepository {
  constructor(
    @Inject(DATABASE_TOKENS.DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: NewAuditRow): Promise<AuditRow> {
    const [row] = await this.db.insert(auditLogs).values(data).returning();
    if (!row) {
      throw new Error('Insert returned no row');
    }
    return row;
  }

  async findMany(
    filter: AuditQueryFilter,
    page: number,
    limit: number,
  ): Promise<AuditRow[]> {
    const conditions: SQL[] = [];
    if (filter.entity) conditions.push(eq(auditLogs.entity, filter.entity));
    if (filter.performedBy)
      conditions.push(eq(auditLogs.performedBy, filter.performedBy));
    if (filter.from) conditions.push(gte(auditLogs.createdAt, filter.from));
    if (filter.to) conditions.push(lte(auditLogs.createdAt, filter.to));

    return this.db
      .select()
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
  }
}
