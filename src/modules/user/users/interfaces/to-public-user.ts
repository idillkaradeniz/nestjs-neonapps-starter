import { PublicUserRow } from './public-user-row.type';
import { UserRow } from './user-row.type';

// Explicit allowlist, not a blacklist-style `Omit`/destructure — if a
// new sensitive column (e.g. a 2FA secret) is ever added to the users
// table, it does NOT automatically appear here. Someone has to
// consciously add it to this list before it can leave the server.
export function toPublicUser(user: UserRow): PublicUserRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
