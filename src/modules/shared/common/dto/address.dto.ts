import { IsNotEmpty, IsString } from 'class-validator';

// A small nested DTO — validated as its own object wherever it's used
// (see nested-validation-example.dto.ts) rather than duplicated field
// by field into whatever DTO embeds it.
export class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;
}
