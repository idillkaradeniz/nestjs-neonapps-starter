import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from  '../../shared/common/enums';

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
