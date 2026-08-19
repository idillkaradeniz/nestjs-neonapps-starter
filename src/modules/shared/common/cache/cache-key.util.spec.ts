import { buildEntityKey, buildListKey } from './cache-key.util';

describe('buildEntityKey', () => {
  it('should join entity name and id with a colon', () => {
    expect(buildEntityKey('user', 123)).toBe('user:123');
  });
});

describe('buildListKey', () => {
  it('should produce the same key regardless of param order', () => {
    const keyA = buildListKey('user', { status: 'active', page: 1 });
    const keyB = buildListKey('user', { page: 1, status: 'active' });
    expect(keyA).toBe(keyB);
  });

  it('should produce different keys for different params', () => {
    const keyA = buildListKey('user', { page: 1 });
    const keyB = buildListKey('user', { page: 2 });
    expect(keyA).not.toBe(keyB);
  });
});
