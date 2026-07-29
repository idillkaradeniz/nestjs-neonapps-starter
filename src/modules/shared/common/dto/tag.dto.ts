import { IsNotEmpty, IsString } from 'class-validator';

// A minimal nested DTO used to demonstrate validating an ARRAY of
// nested objects (see nested-validation-example.dto.ts).
export class TagDto {
  @IsString()
  @IsNotEmpty()
  label: string;
}
