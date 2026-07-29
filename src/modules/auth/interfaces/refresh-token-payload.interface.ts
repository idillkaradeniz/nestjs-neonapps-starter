// Refresh-token payload. `jti` (JWT ID) is the standard claim for a
// token's unique id — it doubles as the primary key of its
// refresh_tokens row, so verifying a refresh token is: (1) check the
// JWT signature/expiry, (2) look up the row by jti, (3) bcrypt-compare
// the raw token against the row's stored hash.
export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}
