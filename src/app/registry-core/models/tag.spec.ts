import { Repository } from './repository';
import { Tag } from './tag';

describe('Tag', () => {
  it('should create an instance', () => {
    expect(new Tag(new Repository([],"name"), "tag", [])).toBeTruthy();
  });
});
