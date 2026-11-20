import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(StorageService);
  });

  it('should save, read and clear strings', () => {
    expect(service.existsInLocalStorage('k')).toBe(false);
    expect(service.getStringFromLocalStorage('k')).toBeNull();
    service.saveStringToLocalStorage('k', 'v');
    expect(service.existsInLocalStorage('k')).toBe(true);
    expect(service.getStringFromLocalStorage('k')).toBe('v');
    service.clearObjectInLocalStorage('k');
    expect(service.existsInLocalStorage('k')).toBe(false);
  });

  it('should serialize objects as JSON and keep strings as they are', () => {
    service.saveObjectToLocalStorage('obj', { a: 1 });
    expect(localStorage.getItem('obj')).toBe('{"a":1}');
    expect(service.getObjectFromLocalStorage('obj')).toEqual({ a: 1 });
    service.saveObjectToLocalStorage('str', 'plain');
    expect(localStorage.getItem('str')).toBe('plain');
    expect(service.getObjectFromLocalStorage('missing')).toBeNull();
  });

  it('should hand out the same cache instance per key', () => {
    expect(service.getMapCache('m')).toBe(service.getMapCache('m'));
    expect(service.getArrayCache('a')).toBe(service.getArrayCache('a'));
    expect(service.getMapCache('m')).not.toBe(service.getMapCache('other'));
  });

  it('should clear all caches', () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const map = service.getMapCache<string, number>('m');
    const array = service.getArrayCache<string>('a');
    map.set('x', 1);
    array.set(['y']);
    service.clearCaches();
    expect(map.has('x')).toBe(false);
    expect(array.values).toEqual([]);
  });
});
