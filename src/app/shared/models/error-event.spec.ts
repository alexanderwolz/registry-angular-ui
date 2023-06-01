import { ErrorEvent } from './error-event';

describe('ErrorEvent', () => {
  it('should create an instance', () => {
    expect(new ErrorEvent("error", null)).toBeTruthy();
  });
});
