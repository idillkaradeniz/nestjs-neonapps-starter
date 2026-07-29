import { IsOptional, IsString } from 'class-validator';

// Reusable shape for any field that needs a Turkish/English pair
// (e.g. a product title). Both languages are individually optional
// here — the "at least one required" rule lives in the validator
// below, not in this shape, because "which languages exist" and "is
// at least one filled in" are two different concerns.
export class LocalizedTextDto {
  @IsOptional()
  @IsString()
  tr?: string;

  @IsOptional()
  @IsString()
  en?: string;
}
