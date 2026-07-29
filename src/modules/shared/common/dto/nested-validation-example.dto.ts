import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { AddressDto } from './address.dto';
import { TagDto } from './tag.dto';

// Reference example (not wired to a real endpoint) showing how to
// validate a SINGLE nested object and an ARRAY of nested objects.
export class NestedValidationExampleDto {
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags: TagDto[];
}
