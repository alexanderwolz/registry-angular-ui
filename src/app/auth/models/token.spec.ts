import { Token } from './token';

describe('Token', () => {
  afterEach(() => vi.useRealTimers());

  it('should keep id and credentials', () => {
    const token = new Token('user', 'base64');
    expect(token.id).toBe('user');
    expect(token.base64Credentials).toBe('base64');
  });

  it('should expire exactly two hours after creation', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    const token = new Token('user', 'base64');
    expect(token.exp).toBe(Math.floor(new Date('2024-01-01T02:00:00Z').getTime() / 1000));
  });
});
