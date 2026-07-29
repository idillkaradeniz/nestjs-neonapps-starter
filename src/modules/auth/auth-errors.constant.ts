import { DomainException } from '../shared/common/errors/domain.exception';
import { ErrorCodeDefinition } from '../shared/common/errors/error-code-definition.interface';
import { AuthErrorCode } from './auth-error-code.enum';

export const AUTH_ERRORS: Record<AuthErrorCode, ErrorCodeDefinition> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: {
    code: AuthErrorCode.INVALID_CREDENTIALS,
    status: 401,
    message: 'Invalid email or password',
  },
  [AuthErrorCode.TOKEN_MISSING]: {
    code: AuthErrorCode.TOKEN_MISSING,
    status: 401,
    message: 'No access token was provided',
  },
  [AuthErrorCode.TOKEN_EXPIRED]: {
    code: AuthErrorCode.TOKEN_EXPIRED,
    status: 401,
    message: 'Access token has expired',
  },
  [AuthErrorCode.TOKEN_INVALID]: {
    code: AuthErrorCode.TOKEN_INVALID,
    status: 401,
    message: 'Access token is invalid',
  },
  [AuthErrorCode.REFRESH_TOKEN_INVALID]: {
    code: AuthErrorCode.REFRESH_TOKEN_INVALID,
    status: 401,
    message: 'Refresh token is invalid or has already been used',
  },
  [AuthErrorCode.REFRESH_TOKEN_EXPIRED]: {
    code: AuthErrorCode.REFRESH_TOKEN_EXPIRED,
    status: 401,
    message: 'Refresh token has expired',
  },
  [AuthErrorCode.TOO_MANY_ATTEMPTS]: {
    code: AuthErrorCode.TOO_MANY_ATTEMPTS,
    status: 429,
    message: 'Too many login attempts — try again later',
  },
};

// Ergonomic, type-checked constructors — call sites throw
// AuthErrors.tokenExpired() instead of hand-building a DomainException.
export const AuthErrors = {
  invalidCredentials: () =>
    new DomainException(AUTH_ERRORS[AuthErrorCode.INVALID_CREDENTIALS]),
  tokenMissing: () =>
    new DomainException(AUTH_ERRORS[AuthErrorCode.TOKEN_MISSING]),
  tokenExpired: () =>
    new DomainException(AUTH_ERRORS[AuthErrorCode.TOKEN_EXPIRED]),
  tokenInvalid: () =>
    new DomainException(AUTH_ERRORS[AuthErrorCode.TOKEN_INVALID]),
  refreshTokenInvalid: () =>
    new DomainException(AUTH_ERRORS[AuthErrorCode.REFRESH_TOKEN_INVALID]),
  refreshTokenExpired: () =>
    new DomainException(AUTH_ERRORS[AuthErrorCode.REFRESH_TOKEN_EXPIRED]),
  tooManyAttempts: () =>
    new DomainException(AUTH_ERRORS[AuthErrorCode.TOO_MANY_ATTEMPTS]),
};
