// Access-token payload. `sub` (subject) is the JWT-standard claim name
// for "who this token is about" — we put the user id there. Nothing
// sensitive: no passwordHash, no role/permission data that would go
// stale before the token expires.
export interface JwtPayload {
  sub: string;
  email: string;
}
