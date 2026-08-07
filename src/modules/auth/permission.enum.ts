// Fine-grained capabilities, one level below UserRole. A role maps to a set
// of these via ROLE_PERMISSIONS (role-permissions.constant.ts) — routes
// declare @RequirePermission(...) instead of @Roles(...) so that changing
// what a role can do later means editing the map, not the route.
// Same const-object + derived-type pattern as UserRole, for the same
// reason: values coming out of ROLE_PERMISSIONS need to stay structurally
// comparable without cast gymnastics.
export const Permission = {
  USER_READ: 'USER_READ',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_MANAGE_ROLES: 'USER_MANAGE_ROLES',
  AUDIT_READ: 'AUDIT_READ',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];
