import { Image } from 'src/app/registry-core/models/image';
import { Repository } from 'src/app/registry-core/models/repository';
import { Tag } from 'src/app/registry-core/models/tag';
import { Configuration } from 'src/app/registry-core/models/docker/configuration';
import { Manifest } from 'src/app/registry-core/models/docker/manifest';
import { RegistryUtils } from 'src/app/registry-core/utils/registry-utils';

export function manifest(
  configDigest = 'sha256:' + 'a'.repeat(64),
  layerSizes: number[] = [100, 2048],
): Manifest {
  return {
    mediaType: RegistryUtils.MEDIA_DOCKER_MANIFEST,
    schemaVersion: 2,
    config: {
      mediaType: 'application/vnd.docker.container.image.v1+json',
      size: 1,
      digest: configDigest,
    },
    layers: layerSizes.map((size, i) => ({
      mediaType: 'application/vnd.docker.image.rootfs.diff.tar.gzip',
      size,
      digest: 'sha256:layer' + i,
    })),
  } as unknown as Manifest;
}

export function configuration(overrides: Partial<Configuration> = {}): Configuration {
  return {
    architecture: 'amd64',
    os: 'linux',
    variant: '',
    created: '2024-01-01T00:00:00Z',
    history: [
      { created: '', created_by: '/bin/sh -c #(nop) ADD file:abc in / ', empty_layer: false },
      { created: '', created_by: '/bin/sh -c #(nop)  CMD ["sh"]', empty_layer: true },
      { created: '', created_by: '/bin/sh -c apk add curl', empty_layer: false },
    ],
    ...overrides,
  } as unknown as Configuration;
}

/** Builds an (unsigned) JWT whose payload is the given object. */
export function jwt(payload: object): string {
  const encode = (o: object) =>
    btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'none' })}.${encode(payload)}.sig`;
}

export function repository(name = 'app', ...namespaces: string[]): Repository {
  return new Repository('http://localhost:5000', namespaces, name);
}

export function tag(
  name = 'latest',
  repo: Repository = repository(),
  architectures: string[] = ['amd64'],
): Tag {
  const images = architectures.map(
    (architecture, i) =>
      new Image(manifest('sha256:' + String(i).repeat(64)), configuration({ architecture })),
  );
  return new Tag(
    'sha256:tag-' + name,
    'application/vnd.docker.distribution.manifest.v2+json',
    repo,
    name,
    images,
  );
}
