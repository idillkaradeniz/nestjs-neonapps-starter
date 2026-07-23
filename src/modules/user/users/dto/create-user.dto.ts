import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// DTO = the declared shape of an incoming request body.
// The global ValidationPipe validates every request against these
// decorators before the controller method runs.
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
}
