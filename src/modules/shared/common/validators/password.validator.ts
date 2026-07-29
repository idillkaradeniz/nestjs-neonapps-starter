import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Single source of truth for the "strong password" rule: at least 8
// characters, one uppercase letter, one digit, one symbol. Every DTO
// that needs this rule (register, change-password, ...) applies the
// same @IsStrongPassword() decorator instead of copy-pasting a set of
// @MinLength/@Matches decorators — if the rule changes, it changes here
// once, and every DTO using it picks up the new rule automatically.
@ValidatorConstraint({ name: 'isStrongPassword', async: false })
class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;

    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);

    return hasMinLength && hasUppercase && hasDigit && hasSymbol;
  }

  defaultMessage(): string {
    return 'Password must be at least 8 characters and include an uppercase letter, a digit, and a symbol';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsStrongPasswordConstraint,
    });
  };
}
