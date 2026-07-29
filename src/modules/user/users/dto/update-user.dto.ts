import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// Every field from CreateUserDto, made optional — same validators
// (@IsString, @IsEmail) still apply if a field IS provided, just not
// required. No copy-pasted rules, no drift between create/update.
export class UpdateUserDto extends PartialType(CreateUserDto) {}
