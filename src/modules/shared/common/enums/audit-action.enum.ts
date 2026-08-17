// The three write actions we audit — matches the brief's action/entity
// shape. Kept as an enum (not a free string) so a typo can't silently
// create an untracked action value.
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
