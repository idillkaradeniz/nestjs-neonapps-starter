import { IsNotEmpty, IsString } from 'class-validator';

// DTO = the declared shape of an incoming request body.
// The global ValidationPipe (see src/main.ts) validates every request
// against these decorators BEFORE the controller method runs:
//   - a missing/empty/non-string `title` -> automatic 400 response
//   - any extra property -> rejected (forbidNonWhitelisted)
// One class per file — nested DTOs get their own files too.
export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
