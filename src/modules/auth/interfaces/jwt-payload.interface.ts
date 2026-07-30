import { UserRole } from '../../user/users/user-role.enum';

// Access-token payload. `sub` (subject) is the JWT-standard claim name
// for "who this token is about" — we put the user id there. Nothing
// sensitive: no passwordHash, no role/permission data that would go
// stale before the token expires... except role DOES go here now (Day
// 8) — accepted trade-off: role can be up to 15 min stale after a
// change, until the access token expires or is refreshed.
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
