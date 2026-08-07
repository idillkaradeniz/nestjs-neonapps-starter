// Internal marker CacheInterceptor wraps its result in — lets
// ResponseTransformInterceptor recognize "this came from the cache
// layer, unwrap it and surface meta.isCached/cachedAt" without the two
// interceptors otherwise knowing about each other.
export interface CacheEnvelope<T> {
  __cacheMeta: true;
  data: T;
  meta: {
    isCached: boolean;
    cachedAt: string;
  };
}

export function isCacheEnvelope(
  value: unknown,
): value is CacheEnvelope<unknown> {
  return typeof value === 'object' && value !== null && '__cacheMeta' in value;
}

export function wrapCacheMeta<T>(
  data: T,
  isCached: boolean,
  cachedAt: string,
): CacheEnvelope<T> {
  return { __cacheMeta: true, data, meta: { isCached, cachedAt } };
}
