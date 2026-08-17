import { UserRole } from '../../shared/common/enums';

// What JwtStrategy.validate() puts on request.user, and what
// @CurrentUser() hands back to a controller.
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}
