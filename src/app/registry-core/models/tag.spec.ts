import { configuration, manifest } from 'src/testing/fixtures';
import { Image } from './image';
import { Repository } from './repository';
import { Tag } from './tag';
import { RegistryUtils } from '../utils/registry-utils';

describe('Tag', () => {
  const repository = new Repository('https://registry.example.com', ['team', 'sub'], 'app');
  const image = (os: string, architecture: string) =>
    new Image(manifest(), configuration({ os, architecture }));

  it('should group platforms by operating system', () => {
    const tag = new Tag(
      'sha256:x',
      RegistryUtils.MEDIA_DOCKER_MANIFEST_LIST,
      repository,
      'latest',
      [image('linux', 'amd64'), image('linux', 'arm64'), image('windows', 'amd64')],
    );
    expect(tag.getPlatformNames()).toEqual(['linux', 'windows']);
    expect(tag.platforms.get('linux')?.length).toBe(2);
    expect(tag.getPlatformTooltip('linux')).toBe(
      'Operating System: linux\nArchitecture: amd64, arm64',
    );
  });

  it('should have no platforms without images', () => {
    expect(new Tag('d', 'm', repository, 'latest', []).getPlatformNames()).toEqual([]);
  });

  it('should build paths and commands', () => {
    const tag = new Tag('d', RegistryUtils.MEDIA_OCI_INDEX, repository, 'v1', []);
    expect(tag.getRelativePath()).toBe('team/sub/app:v1');
    expect(tag.getAbsolutePath()).toBe('registry.example.com/team/sub/app:v1');
    expect(tag.getPullCommand()).toBe('docker pull registry.example.com/team/sub/app:v1');
    expect(tag.getPushCommand()).toBe('docker push registry.example.com/team/sub/app:v1');
    expect(tag.getType()).toBe(RegistryUtils.TYPE_IMAGE);
  });

  it('should report unknown media types', () => {
    expect(new Tag('d', 'text/plain', repository, 'v1', []).getType()).toBe(
      RegistryUtils.TYPE_UNKNOWN,
    );
  });
});
