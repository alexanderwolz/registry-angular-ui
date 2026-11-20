import { MapCache } from './map-cache';

describe('MapCache', () => {
  it('should store, find and delete entries', () => {
    const cache = new MapCache<string, number>();
    expect(cache.has('a')).toBe(false);
    expect(cache.get('a')).toBeUndefined();
    cache.set('a', 1);
    expect(cache.has('a')).toBe(true);
    expect(cache.get('a')).toBe(1);
    expect(cache.delete('a')).toBe(true);
    expect(cache.delete('a')).toBe(false);
  });

  it('should drop everything on clear', () => {
    const cache = new MapCache<string, number>();
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.has('a') || cache.has('b')).toBe(false);
  });
});
