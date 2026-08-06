import { ApiProperty } from '@nestjs/swagger';

// Swagger-only mirror of Colleague. `team` is a derived string-literal
// union (see team.type.ts) — documented as plain string since Swagger
// needs a concrete enum array, not a type alias.
export class ColleagueResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  team: string;
}
