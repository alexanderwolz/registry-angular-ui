import { Pagination } from './pagination';

describe('Pagination', () => {
  it('should keep limit and last', () => {
    const pagination = new Pagination(10, 'last-tag');
    expect(pagination.limit).toBe(10);
    expect(pagination.last).toBe('last-tag');
  });

  it('should not require last', () => {
    expect(new Pagination(5).last).toBeUndefined();
  });
});
