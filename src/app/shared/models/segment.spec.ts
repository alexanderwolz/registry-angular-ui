import { Segment } from './segment';

describe('Segment', () => {
  it('should only require a name', () => {
    const segment = new Segment('name');
    expect(segment.name).toBe('name');
    expect(segment.routerLink).toBeUndefined();
    expect(segment.active).toBeUndefined();
  });

  it('should keep link, state and query params', () => {
    const segment = new Segment('name', '/a/b', true, { page: '2' });
    expect(segment.routerLink).toBe('/a/b');
    expect(segment.active).toBe(true);
    expect(segment.queryParams).toEqual({ page: '2' });
  });
});
