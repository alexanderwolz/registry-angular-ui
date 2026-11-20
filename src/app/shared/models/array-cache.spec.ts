import { ArrayCache } from './array-cache';

describe('ArrayCache', () => {
  it('should start empty', () => {
    expect(new ArrayCache<string>().values).toEqual([]);
  });

  it('should store and clear values', () => {
    const cache = new ArrayCache<string>();
    cache.set(['a', 'b']);
    expect(cache.values).toEqual(['a', 'b']);
    cache.clear();
    expect(cache.values).toEqual([]);
  });
});
