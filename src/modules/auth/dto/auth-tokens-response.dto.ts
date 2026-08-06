import { ApiProperty } from '@nestjs/swagger';

// Swagger-only mirror of AuthTokens — register/login/refresh all return
// this shape.
export class AuthTokensResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
