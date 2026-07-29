import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_TOKENS } from '../shared/database/database.tokens';
import * as schema from '../shared/database/schema';
import { refreshTokens } from '../shared/database/schema/refresh-token.schema';
import { NewRefreshTokenRow } from './interfaces/new-refresh-token-row.type';
import { RefreshTokenRow } from './interfaces/refresh-token-row.type';

// Repository = the only layer that touches the refresh_tokens table.
// Mirrors UserRepository's shape (constructor injection of the Drizzle
// token, one method per operation).
@Injectable()
export class RefreshTokenRepository {
  constructor(
    @Inject(DATABASE_TOKENS.DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(
    row: Pick<NewRefreshTokenRow, 'id' | 'userId' | 'tokenHash' | 'expiresAt'>,
  ): Promise<RefreshTokenRow> {
    const [inserted] = await this.db
      .insert(refreshTokens)
      .values(row)
      .returning();
    if (!inserted) {
      throw new Error('Insert returned no row');
    }
    return inserted;
  }

  async findById(id: string): Promise<RefreshTokenRow | undefined> {
    const [row] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.id, id));
    return row;
  }

  // void-ok — rotation deletes the old row; nothing meaningful to return.
  async deleteById(id: string): Promise<void> {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.id, id));
  }
}
