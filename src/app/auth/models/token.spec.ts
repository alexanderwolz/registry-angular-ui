import { Token } from './token';

describe('Token', () => {
  it('should create an instance', () => {
    expect(new Token("user", "base64")).toBeTruthy();
  });
});
