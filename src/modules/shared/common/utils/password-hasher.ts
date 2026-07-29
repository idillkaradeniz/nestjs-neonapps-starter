import * as bcrypt from 'bcrypt';

// Single source of truth for how passwords are hashed/compared — every
// place that touches a raw password (AuthService.register(),
// AuthService.login(), UserService.create()) goes through here, so the
// cost factor lives in exactly one place, and the plain-text password
// never has more than one hop before it becomes a hash.
const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
