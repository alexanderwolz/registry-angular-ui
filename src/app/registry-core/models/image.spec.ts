import { configuration, manifest } from 'src/testing/fixtures';
import { Image } from './image';
import { Layer } from './layer';
import { RegistryUtils } from '../utils/registry-utils';

describe('Image', () => {
  const digest = 'sha256:' + 'abcdef0123456789'.repeat(4);

  it('should derive digest and short digest from the config digest', () => {
    const image = new Image(manifest(digest), configuration());
    expect(image.digest).toBe(digest);
    expect(image.digestShort).toBe('abcdef012345');
  });

  it('should build the platform string with and without variant', () => {
    expect(new Image(manifest(), configuration()).platformString).toBe('linux/amd64');
    const arm = new Image(manifest(), configuration({ architecture: 'arm', variant: 'v7' }));
    expect(arm.platformString).toBe('linux/arm/v7');
    expect(arm.platform).toEqual({ os: 'linux', architecture: 'arm', variant: 'v7' });
  });

  it('should sum up the compressed size of all layers', () => {
    expect(
      new Image(manifest(digest, [100, 2048]), configuration()).totalCompressedSizeString,
    ).toBe('2.10 KB');
    expect(
      new Image(manifest(digest, [Layer.MB, Layer.MB]), configuration()).totalCompressedSizeString,
    ).toBe('2.00 MB');
  });

  it('should assign layer sizes only to history entries that are not empty layers', () => {
    const image = new Image(manifest(digest, [100, 2048]), configuration());
    expect(image.layers.map((l) => l.size)).toEqual([100, 0, 2048]);
    expect(image.layers.map((l) => l.command)).toEqual(['ADD', 'CMD', 'RUN']);
  });

  it('should be of type image for known media types', () => {
    expect(new Image(manifest(), configuration()).getType()).toBe(RegistryUtils.TYPE_IMAGE);
  });
});
