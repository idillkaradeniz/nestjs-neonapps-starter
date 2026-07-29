import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from '../../shared/common/validators/password.validator';

// DTO = the declared shape of an incoming request body. Register is
// effectively "create a user, then log them in" — the shape mirrors
// CreateUserDto on purpose.
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
