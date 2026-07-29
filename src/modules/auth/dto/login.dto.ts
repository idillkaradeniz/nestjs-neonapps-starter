import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// Deliberately NOT @IsStrongPassword() here — login checks an existing
// password against its stored hash, it doesn't set a new one. Strength
// rules only apply where a password is being CREATED (RegisterDto,
// CreateUserDto), never where one is merely being verified.
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
