// Every error the Auth domain can raise gets a stable, unique code here.
// Codes are prefixed with AUTH_ so they stay unique once merged into the
// global ERROR_REGISTRY alongside other domains' codes (see Day 5).
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  TOKEN_MISSING = 'AUTH_TOKEN_MISSING',
  TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  REFRESH_TOKEN_INVALID = 'AUTH_REFRESH_TOKEN_INVALID',
  REFRESH_TOKEN_EXPIRED = 'AUTH_REFRESH_TOKEN_EXPIRED',
  TOO_MANY_ATTEMPTS = 'AUTH_TOO_MANY_ATTEMPTS',
}
