// What JwtStrategy.validate() puts on request.user, and what
// @CurrentUser() hands back to a controller. Deliberately thin — id and
// email only, nothing sensitive, since this shape is derived straight
// from the access-token payload (see jwt-payload.interface.ts).
export interface AuthenticatedUser {
  id: string;
  email: string;
}
