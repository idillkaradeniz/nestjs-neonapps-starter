import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_TOKENS } from '../../shared/database/database.tokens';
import * as schema from '../../shared/database/schema';
import { users } from '../../shared/database/schema/user.schema';
import { NewUserRow } from './interfaces/new-user-row.type';
import { UserRow } from './interfaces/user-row.type';
import { UserRole } from './user-role.enum';

// Repository = the ONLY layer that touches storage. db.select()/insert()/
// update() appear ONLY here — the no-db-in-service guard enforces this.
// Soft delete: rows are never removed, isActive is flipped to false and
// list queries filter on it (see findAll).
@Injectable()
export class UserRepository {
  constructor(
    @Inject(DATABASE_TOKENS.DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll(page: number, limit: number): Promise<UserRow[]> {
    return this.db
      .select()
      .from(users)
      .where(eq(users.isActive, true))
      .limit(limit)
      .offset((page - 1) * limit);
  }

  async findOne(id: string): Promise<UserRow | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.isActive, true)));
    return user;
  }

  async findByEmail(email: string): Promise<UserRow | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isActive, true)));
    return user;
  }

  async create(
    data: Pick<NewUserRow, 'name' | 'email' | 'passwordHash'>,
  ): Promise<UserRow> {
    const [user] = await this.db.insert(users).values(data).returning();
    if (!user) {
      throw new Error('Insert returned no row');
    }
    return user;
  }

  async update(
    id: string,
    changes: Partial<Pick<UserRow, 'name' | 'email'>>,
  ): Promise<UserRow | undefined> {
    const [user] = await this.db
      .update(users)
      .set(changes)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Soft delete — flips isActive instead of deleting the row.
  async remove(id: string): Promise<boolean> {
    const [user] = await this.db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, id))
      .returning();
    return Boolean(user);
  }

  // Used by UserService.updateRole() to enforce "cannot demote the last
  // ADMIN" — counts only active users, since a deactivated admin
  // shouldn't count as protection against demoting the real last one.
  async countByRole(role: UserRole): Promise<number> {
    const rows = await this.db
      .select()
      .from(users)
      .where(and(eq(users.role, role), eq(users.isActive, true)));
    return rows.length;
  }

  async updateRole(id: string, role: UserRole): Promise<UserRow | undefined> {
    const [user] = await this.db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Demonstrates db.transaction(): two inserts wrapped in one transaction.
  // The second insert intentionally reuses the first user's email, which
  // violates the unique constraint — both inserts roll back together.
  // Exercised by scripts/test-transaction-rollback.mjs, not by any HTTP route.
  // passwordHash is required here too now that the column is NOT NULL.
  async createTwoUsersInTransaction(
    first: Pick<NewUserRow, 'name' | 'email' | 'passwordHash'>,
    second: Pick<NewUserRow, 'name' | 'email' | 'passwordHash'>,
    // void-ok — this is a proof-of-concept method with no result to return.
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(users).values(first).returning();
      await tx.insert(users).values(second).returning();
    });
  }
}
