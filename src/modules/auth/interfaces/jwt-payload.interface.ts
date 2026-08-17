import { UserRole } from '../../shared/common/enums';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
