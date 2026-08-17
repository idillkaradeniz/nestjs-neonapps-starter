import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../shared/common/enums'

// Swagger-only mirror of PublicUserRow.
export class PublicUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
