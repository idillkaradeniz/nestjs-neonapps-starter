import { DomainException } from '../../shared/common/errors/domain.exception';
import { ErrorCodeDefinition } from '../../shared/common/errors/error-code-definition.interface';
import { UserErrorCode } from '../../shared/common/enums';

export const USER_ERRORS: Record<UserErrorCode, ErrorCodeDefinition> = {
  [UserErrorCode.NOT_FOUND]: {
    code: UserErrorCode.NOT_FOUND,
    status: 404,
    message: 'User {id} not found',
  },
  [UserErrorCode.EMAIL_ALREADY_EXISTS]: {
    code: UserErrorCode.EMAIL_ALREADY_EXISTS,
    status: 409,
    message: 'Email {email} is already registered',
  },
  [UserErrorCode.CANNOT_DEACTIVATE_SELF]: {
    code: UserErrorCode.CANNOT_DEACTIVATE_SELF,
    status: 400,
    message: 'You cannot deactivate your own account',
  },
  [UserErrorCode.CANNOT_DEMOTE_LAST_ADMIN]: {
    code: UserErrorCode.CANNOT_DEMOTE_LAST_ADMIN,
    status: 400,
    message: 'Cannot change role: this is the last remaining ADMIN',
  },
};

// Ergonomic, type-checked constructors — call sites throw
// UserErrors.notFound({ id }) instead of hand-building a DomainException.
export const UserErrors = {
  notFound: (params: { id: string }) =>
    new DomainException(USER_ERRORS[UserErrorCode.NOT_FOUND], params),
  emailAlreadyExists: (params: { email: string }) =>
    new DomainException(
      USER_ERRORS[UserErrorCode.EMAIL_ALREADY_EXISTS],
      params,
    ),
  cannotDeactivateSelf: () =>
    new DomainException(USER_ERRORS[UserErrorCode.CANNOT_DEACTIVATE_SELF]),
  cannotDemoteLastAdmin: () =>
    new DomainException(USER_ERRORS[UserErrorCode.CANNOT_DEMOTE_LAST_ADMIN]),
};
