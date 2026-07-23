import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// DTO = the declared shape of an incoming request body for updates.
// All fields optional — a PATCH may change only some of them.
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
