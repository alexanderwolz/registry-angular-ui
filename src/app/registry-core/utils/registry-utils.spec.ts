import { RegistryUtils } from './registry-utils';

describe('RegistryUtils', () => {
  it('should classify all supported manifest media types as image', () => {
    for (const type of [
      RegistryUtils.MEDIA_DOCKER_MANIFEST,
      RegistryUtils.MEDIA_DOCKER_MANIFEST_LIST,
      RegistryUtils.MEDIA_OCI_INDEX,
      RegistryUtils.MEDIA_OCI_MANIFEST,
    ]) {
      expect(RegistryUtils.getType(type)).toBe(RegistryUtils.TYPE_IMAGE);
    }
  });

  it('should classify anything else as unknown', () => {
    expect(RegistryUtils.getType('application/json')).toBe(RegistryUtils.TYPE_UNKNOWN);
    expect(RegistryUtils.getType('')).toBe(RegistryUtils.TYPE_UNKNOWN);
  });

  it('should accept only single manifests for digest lookups', () => {
    const accept = RegistryUtils.getManifestAcceptHeader().get('Accept')!.split(',');
    expect(accept).toEqual([RegistryUtils.MEDIA_DOCKER_MANIFEST, RegistryUtils.MEDIA_OCI_MANIFEST]);
  });

  it('should accept manifests and indexes for tag lookups', () => {
    const accept = RegistryUtils.getAllManifestsAcceptHeader().get('Accept')!.split(',');
    expect(accept).toContain(RegistryUtils.MEDIA_DOCKER_MANIFEST_LIST);
    expect(accept).toContain(RegistryUtils.MEDIA_OCI_INDEX);
    expect(accept.length).toBe(4);
  });
});
