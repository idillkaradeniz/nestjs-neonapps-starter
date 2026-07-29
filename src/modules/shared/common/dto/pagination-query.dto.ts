import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

// Reusable query-param shape for any paginated list endpoint. Query
// params always arrive as strings ("page=2") — @Type(() => Number)
// coerces them to real numbers before @IsInt()/@Min() run, and before
// the controller ever sees them.
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}
