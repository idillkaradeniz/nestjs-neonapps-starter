import { users } from '../../../shared/database/schema/user.schema';

// Row type derived from the schema — never hand-write this.
export type UserRow = typeof users.$inferSelect;
