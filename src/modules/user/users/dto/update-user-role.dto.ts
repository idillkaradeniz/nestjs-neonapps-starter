import { IsEnum } from 'class-validator';
import { UserRole } from '../user-role.enum';

// PATCH /users/:id/role body — the only field an admin can set through
// this endpoint. Business rules (can't change your own role, can't
// demote the last ADMIN) live in UserService.updateRole(), not here —
// this DTO only checks the SHAPE of the request, not who's allowed to
// make it.
export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
