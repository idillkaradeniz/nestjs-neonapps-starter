import { createHash } from 'node:crypto';

// The one rule that prevents the privacy disaster (Day 12's core lesson):
// a cache key must fully encode whatever makes the result unique. Two
// conventions, both enforced here so nobody hand-rolls a key string:
// - buildEntityKey: one record   -> "user:123"
// - buildListKey:   a query/list -> "user:list:<hash-of-params>"
export function buildEntityKey(entity: string, id: string | number): string {
  return `${entity}:${id}`;
}

export function buildListKey(
  entity: string,
  params: Record<string, unknown>,
): string {
  const normalized = JSON.stringify(
    Object.keys(params)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {}),
  );
  const hash = createHash('sha1').update(normalized).digest('hex').slice(0, 12);
  return `${entity}:list:${hash}`;
}
