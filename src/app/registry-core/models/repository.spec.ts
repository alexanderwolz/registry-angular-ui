import { Repository } from './repository';

describe('Repository', () => {
  it('should strip the protocol from the registry host', () => {
    expect(new Repository('https://localhost:5000', [], 'image').registry).toBe('localhost:5000');
    expect(new Repository('http://localhost:5000', [], 'image').registry).toBe('localhost:5000');
  });

  it('should split namespace and segments', () => {
    const repository = new Repository('http://localhost', ['user', 'team', 'sub'], 'image');
    expect(repository.namespace).toBe('user');
    expect(repository.segments).toEqual(['team', 'sub']);
    expect(repository.getAllNamespacesAndNameAsArray()).toEqual(['user', 'team', 'sub', 'image']);
  });

  it('should treat missing namespaces as none', () => {
    const repository = new Repository('http://localhost', null, 'image');
    expect(repository.namespace).toBeUndefined();
    expect(repository.getRelativePath()).toBe('image');
    expect(repository.getAbsolutePath()).toBe('localhost/image');
  });

  it('should build absolute path and push command', () => {
    const repository = new Repository('https://reg.io', ['user', 'team'], 'image');
    expect(repository.getAbsolutePath()).toBe('reg.io/user/team/image');
    expect(repository.getPushCommand()).toBe('docker push reg.io/user/team/image:tagname');
  });

  it('should round-trip repository strings', () => {
    for (const value of ['image', 'user/image', 'user/team/sub/image']) {
      expect(Repository.fromString('http://localhost', value).getRelativePath()).toBe(value);
    }
  });

  it('should reject the reserved default namespace', () => {
    expect(
      () => new Repository('http://localhost', [Repository.DEFAULT_NAMESPACE], 'image'),
    ).toThrow();
  });
});
