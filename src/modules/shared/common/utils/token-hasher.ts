import { createHash, timingSafeEqual } from 'node:crypto';

// Refresh tokens are high-entropy, random-looking JWTs — not low-entropy
// human passwords — so they don't need bcrypt's slow, brute-force-
// resistant hashing. Using bcrypt here would also be a real bug: bcrypt
// silently truncates any input past 72 bytes, and a signed JWT is
// almost always longer than that, which would make comparisons
// unreliable. A fast SHA-256 digest plus a timing-safe compare is the
// standard approach for storing session/refresh tokens.
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function compareTokenHash(token: string, hash: string): boolean {
  const candidate = Buffer.from(hashToken(token), 'hex');
  const stored = Buffer.from(hash, 'hex');
  if (candidate.length !== stored.length) {
    return false;
  }
  return timingSafeEqual(candidate, stored);
}
