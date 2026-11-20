import { Scope } from './scope';

describe('Scope', () => {
  it('should serialize to the registry token scope format', () => {
    expect(new Scope('repository', 'team/app', ['pull', 'delete']).toString()).toBe(
      'repository:team/app:pull,delete',
    );
    expect(new Scope('registry', 'catalog', ['*']).toString()).toBe('registry:catalog:*');
  });
});
