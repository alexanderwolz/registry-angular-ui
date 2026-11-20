import { ErrorEvent } from './error-event';
import { Event } from './event';
import { InfoEvent } from './info-event';

describe('Events', () => {
  it('should carry a message and be distinguishable by type', () => {
    const info = new InfoEvent('hello');
    const error = new ErrorEvent('boom', new Error('cause'));
    expect(info.message).toBe('hello');
    expect(error.message).toBe('boom');
    expect(error.cause?.message).toBe('cause');
    expect(info instanceof Event && error instanceof Event).toBe(true);
    expect(info instanceof ErrorEvent).toBe(false);
  });
});
