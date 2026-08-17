export const Permission = {
  USER_READ: 'USER_READ',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_MANAGE_ROLES: 'USER_MANAGE_ROLES',
  AUDIT_READ: 'AUDIT_READ',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];
