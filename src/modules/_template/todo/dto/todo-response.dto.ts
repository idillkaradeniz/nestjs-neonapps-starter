import { ApiProperty } from '@nestjs/swagger';

// Swagger-only mirror of Todo.
export class TodoResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  done: boolean;
}
