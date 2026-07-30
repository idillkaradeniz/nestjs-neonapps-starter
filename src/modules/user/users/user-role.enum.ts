// Mirrors the Postgres enum values in user.schema.ts exactly. Defined as
// a const object + derived type (NOT a TS `enum`) on purpose: Drizzle
// infers the `role` column as the plain string-literal union
// "ADMIN" | "USER" | "MODERATOR", and TypeScript string enums are
// nominally typed — a matching string literal isn't automatically
// assignable to an enum member. This pattern keeps the UserRole.ADMIN
// dot-notation of an enum while staying structurally compatible with
// values coming straight out of the database.
export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MODERATOR: 'MODERATOR',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
