import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../user/users/user-role.enum';

// Swagger-only mirror of AuthenticatedUser — that's an interface (no
// decorators possible), this is the class Swagger needs to document
// GET /auth/me's response shape.
export class AuthenticatedUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;
}
