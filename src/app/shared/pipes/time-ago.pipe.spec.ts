import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  const pipe = new TimeAgoPipe();
  const now = new Date('2024-06-15T12:00:00Z');
  const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000).toISOString();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });
  afterEach(() => vi.useRealTimers());

  it('should return falsy values unchanged', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null)).toBeNull();
  });

  it('should say "Just now" below 30 seconds', () => {
    expect(pipe.transform(ago(5))).toBe('Just now');
  });

  it('should use singular and plural units', () => {
    expect(pipe.transform(ago(60))).toBe('1 minute ago');
    expect(pipe.transform(ago(5 * 60))).toBe('5 minutes ago');
    expect(pipe.transform(ago(3600))).toBe('1 hour ago');
    expect(pipe.transform(ago(2 * 3600))).toBe('2 hours ago');
    expect(pipe.transform(ago(86400))).toBe('1 day ago');
    expect(pipe.transform(ago(3 * 86400))).toBe('3 days ago');
    expect(pipe.transform(ago(14 * 86400))).toBe('2 weeks ago');
    expect(pipe.transform(ago(400 * 86400))).toBe('1 year ago');
  });

  it('should accept dates and timestamps', () => {
    expect(pipe.transform(new Date(now.getTime() - 2 * 3600 * 1000))).toBe('2 hours ago');
    expect(pipe.transform(now.getTime() - 2 * 3600 * 1000)).toBe('2 hours ago');
  });
});
