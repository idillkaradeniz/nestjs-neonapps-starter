import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from '../../../shared/common/validators/password.validator';

// DTO = the declared shape of an incoming request body.
// The global ValidationPipe validates every request against these
// decorators before the controller method runs.
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  // Reuses the Day 6 custom validator — one source of truth for what
  // "strong enough" means, shared with AuthService.register().
  @IsStrongPassword()
  password: string;
}
