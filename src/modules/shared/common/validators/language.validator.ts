import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LocalizedTextDto } from '../dto/localized-text.dto';

// Single source of truth for "at least one language must be filled
// in" on a { tr, en } object — reusable wherever LocalizedTextDto
// appears, instead of re-checking tr/en by hand in every service.
@ValidatorConstraint({ name: 'hasAtLeastOneLanguage', async: false })
class HasAtLeastOneLanguageConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'object' || value === null) return false;
    const { tr, en } = value as LocalizedTextDto;
    return Boolean(tr?.trim()) || Boolean(en?.trim());
  }

  defaultMessage(): string {
    return 'At least one of tr or en must be provided';
  }
}

export function HasAtLeastOneLanguage(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: HasAtLeastOneLanguageConstraint,
    });
  };
}
