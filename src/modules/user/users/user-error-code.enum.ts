// Every error the User domain can raise gets a stable, unique code here.
// Codes are prefixed with USER_ so they stay unique once merged into the
// global ERROR_REGISTRY alongside other domains' codes.
export enum UserErrorCode {
  NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'USER_EMAIL_ALREADY_EXISTS',
  CANNOT_DEACTIVATE_SELF = 'USER_CANNOT_DEACTIVATE_SELF',
  CANNOT_DEMOTE_LAST_ADMIN = 'USER_CANNOT_DEMOTE_LAST_ADMIN',
}
