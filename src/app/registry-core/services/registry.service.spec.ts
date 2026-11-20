import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { configuration, manifest } from 'src/testing/fixtures';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { AuthProviderService } from 'src/app/auth/services/auth-provider.service';
import { Pagination } from '../models/pagination';
import { Repository } from '../models/repository';
import { RegistryUtils } from '../utils/registry-utils';
import { RegistryService } from './registry.service';
import { CHECK_PULL_ACCESS } from '../../app.tokens';

const BASE = 'http://localhost:5000/v2/';
const CONFIG_DIGEST = 'sha256:' + 'c'.repeat(64);

describe('RegistryService', () => {
  let service: RegistryService;
  let backend: HttpTestingController;
  let authorize: (scope: string) => Observable<string>;

  function setup(checkPullAccess = false) {
    TestBed.configureTestingModule({
      providers: [
        ...TEST_PROVIDERS,
        { provide: CHECK_PULL_ACCESS, useValue: checkPullAccess },
        {
          provide: AuthProviderService,
          useValue: {
            getAuthProvider: () => ({
              getAuthorizationFor: (scope: { toString(): string }) => authorize(scope.toString()),
            }),
          },
        },
      ],
    });
    service = TestBed.inject(RegistryService);
    backend = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => {
    authorize = () => of('Bearer token');
  });

  afterEach(() => backend.verify());

  const repo = (name: string, ...namespaces: string[]) =>
    service.createRepository(namespaces, name);

  function manifestResponse(
    request: TestRequest,
    contentType: string,
    body: object | null,
    digest = 'sha256:tagdigest',
  ) {
    request.flush(body, {
      headers: { 'content-type': contentType, 'docker-content-digest': digest },
    });
  }

  describe('repositories', () => {
    it('should list the catalog with authorization', async () => {
      setup();
      const result = firstValueFrom(service.getAllRepositoryNames());
      const request = backend.expectOne(BASE + '_catalog');
      expect(request.request.method).toBe('GET');
      expect(request.request.headers.get('Authorization')).toBe('Bearer token');
      request.flush({ repositories: ['a', 'team/b'] });
      expect(await result).toEqual(['a', 'team/b']);
    });

    it('should ask for catalog scope', async () => {
      setup();
      const scopes: string[] = [];
      authorize = (scope) => (scopes.push(scope), of('x'));
      const result = firstValueFrom(service.getAllRepositoryNames());
      backend.expectOne(BASE + '_catalog').flush({ repositories: [] });
      await result;
      expect(scopes).toEqual(['registry:catalog:*']);
    });

    it('should serve the catalog from cache after the first call', async () => {
      setup();
      const first = firstValueFrom(service.getAllRepositoryNames());
      backend.expectOne(BASE + '_catalog').flush({ repositories: ['a'] });
      await first;
      expect(await firstValueFrom(service.getAllRepositoryNames())).toEqual(['a']);
      expect(await firstValueFrom(service.getTotalRepositoryCount())).toBe(1);
    });

    it('should group repositories by namespace and keep those without one under the default namespace', async () => {
      setup();
      const result = firstValueFrom(service.getAllRepositoriesMappedByNamespace());
      backend
        .expectOne(BASE + '_catalog')
        .flush({ repositories: ['alone', 'team/a', 'team/sub/b', 'other/c'] });
      const map = await result;
      expect(Array.from(map.keys()).sort()).toEqual([
        Repository.DEFAULT_NAMESPACE,
        'other',
        'team',
      ]);
      expect(map.get('team')!.map((r) => r.getRelativePath())).toEqual(['team/a', 'team/sub/b']);
      expect(map.get(Repository.DEFAULT_NAMESPACE)!.map((r) => r.name)).toEqual(['alone']);
    });

    it('should hide repositories without pull access when access checking is on', async () => {
      setup(true);
      authorize = (scope) =>
        scope.includes('secret') ? throwError(() => new Error('denied')) : of('ok');
      const result = firstValueFrom(service.getAllRepositoriesMappedByNamespace());
      backend.expectOne(BASE + '_catalog').flush({ repositories: ['team/open', 'team/secret'] });
      const map = await result;
      expect(map.get('team')!.map((r) => r.name)).toEqual(['open']);
    });

    it('should keep all repositories when access checking is off', async () => {
      setup(false);
      authorize = (scope) =>
        scope.includes('secret') ? throwError(() => new Error('denied')) : of('ok');
      const result = firstValueFrom(service.getAllRepositoriesMappedByNamespace());
      backend.expectOne(BASE + '_catalog').flush({ repositories: ['team/open', 'team/secret'] });
      expect((await result).get('team')!.length).toBe(2);
    });

    it('should fail without an auth provider', async () => {
      TestBed.configureTestingModule({
        providers: [
          ...TEST_PROVIDERS,
          { provide: AuthProviderService, useValue: { getAuthProvider: () => null } },
        ],
      });
      const failing = TestBed.inject(RegistryService);
      await expect(firstValueFrom(failing.getAllRepositoryNames())).rejects.toThrow(
        'No AuthProvider',
      );
    });
  });

  describe('tags', () => {
    it('should list tag names and send pagination parameters', async () => {
      setup();
      const result = firstValueFrom(
        service.loadTagNames(repo('app', 'team'), new Pagination(10, 'v5')),
      );
      const request = backend.expectOne((r) => r.url === BASE + 'team/app/tags/list');
      expect(request.request.params.get('n')).toBe('10');
      expect(request.request.params.get('last')).toBe('v5');
      request.flush({ name: 'team/app', tags: ['v6', 'v7'] });
      expect(await result).toEqual(['v6', 'v7']);
    });

    it('should omit pagination parameters when not paginating and treat null tags as empty', async () => {
      setup();
      const result = firstValueFrom(service.loadTagNames(repo('app')));
      const request = backend.expectOne(BASE + 'app/tags/list');
      expect(request.request.params.keys()).toEqual([]);
      request.flush({ name: 'app', tags: null });
      expect(await result).toEqual([]);
    });

    it('should cache all tag names per repository', async () => {
      setup();
      const first = firstValueFrom(service.getAllTagNames(repo('app')));
      backend.expectOne(BASE + 'app/tags/list').flush({ tags: ['a'] });
      await first;
      expect(await firstValueFrom(service.getAllTagNames(repo('app')))).toEqual(['a']);
      const other = firstValueFrom(service.getAllTagNames(repo('other')));
      backend.expectOne(BASE + 'other/tags/list').flush({ tags: ['b'] });
      expect(await other).toEqual(['b']);
    });

    it('should load nothing for a repository without tags', async () => {
      setup();
      const result = firstValueFrom(service.loadTags(repo('app')));
      backend.expectOne(BASE + 'app/tags/list').flush({ tags: [] });
      expect(await result).toEqual([]);
    });
  });

  describe('getTag', () => {
    function flushDockerManifest(app = 'app', digest = 'sha256:tagdigest') {
      const request = backend.expectOne(BASE + app + '/manifests/latest');
      expect(request.request.headers.get('Accept')).toBe(
        RegistryUtils.getAllManifestsAcceptHeader().get('Accept'),
      );
      manifestResponse(
        request,
        RegistryUtils.MEDIA_DOCKER_MANIFEST,
        manifest(CONFIG_DIGEST, [100, 2048]),
        digest,
      );
      backend.expectOne(BASE + app + '/blobs/' + CONFIG_DIGEST).flush(configuration());
    }

    it('should assemble a tag from a docker manifest and its config blob', async () => {
      setup();
      const result = firstValueFrom(service.getTag(repo('app', 'team'), 'latest'));
      flushDockerManifest('team/app');
      const tag = await result;
      expect(tag.name).toBe('latest');
      expect(tag.digest).toBe('sha256:tagdigest');
      expect(tag.images.length).toBe(1);
      expect(tag.images[0].platformString).toBe('linux/amd64');
      expect(tag.getAbsolutePath()).toBe('localhost:5000/team/app:latest');
    });

    it('should fall back to the etag header for the digest', async () => {
      setup();
      const result = firstValueFrom(service.getTag(repo('app'), 'latest'));
      const request = backend.expectOne(BASE + 'app/manifests/latest');
      request.flush(manifest(CONFIG_DIGEST), {
        headers: { 'content-type': RegistryUtils.MEDIA_OCI_MANIFEST, etag: 'etag-digest' },
      });
      backend.expectOne(BASE + 'app/blobs/' + CONFIG_DIGEST).flush(configuration());
      expect((await result).digest).toBe('etag-digest');
    });

    it('should resolve a docker manifest list into one image per platform', async () => {
      setup();
      const result = firstValueFrom(service.getTag(repo('app'), 'latest'));
      manifestResponse(
        backend.expectOne(BASE + 'app/manifests/latest'),
        RegistryUtils.MEDIA_DOCKER_MANIFEST_LIST,
        {
          manifests: [{ digest: 'sha256:m1' }, { digest: 'sha256:m2' }],
        },
      );
      const platforms = [
        ['sha256:m1', 'amd64'],
        ['sha256:m2', 'arm64'],
      ];
      for (const [digest, arch] of platforms) {
        const request = backend.expectOne(BASE + 'app/manifests/' + digest);
        expect(request.request.headers.get('Accept')).toBe(
          RegistryUtils.getManifestAcceptHeader().get('Accept'),
        );
        request.flush(manifest('sha256:cfg-' + arch));
      }
      for (const [, arch] of platforms) {
        backend
          .expectOne(BASE + 'app/blobs/sha256:cfg-' + arch)
          .flush(configuration({ architecture: arch }));
      }
      const tag = await result;
      expect(tag.images.map((i) => i.platform.architecture)).toEqual(['amd64', 'arm64']);
      expect(tag.getPlatformTooltip('linux')).toContain('amd64, arm64');
    });

    it('should skip annotated references (attestations) in an OCI index', async () => {
      setup();
      const result = firstValueFrom(service.getTag(repo('app'), 'latest'));
      manifestResponse(
        backend.expectOne(BASE + 'app/manifests/latest'),
        RegistryUtils.MEDIA_OCI_INDEX,
        {
          manifests: [
            { digest: 'sha256:image' },
            {
              digest: 'sha256:attestation',
              annotations: { 'vnd.docker.reference.type': 'attestation-manifest' },
            },
          ],
        },
      );
      backend.expectOne(BASE + 'app/manifests/sha256:image').flush(manifest('sha256:cfg'));
      backend.expectOne(BASE + 'app/blobs/sha256:cfg').flush(configuration());
      backend.expectNone(BASE + 'app/manifests/sha256:attestation');
      expect((await result).images.length).toBe(1);
    });

    it('should reject unsupported content types', async () => {
      setup();
      const result = firstValueFrom(service.getTag(repo('app'), 'latest'));
      manifestResponse(backend.expectOne(BASE + 'app/manifests/latest'), 'text/html', {});
      await expect(result).rejects.toThrow("Unsupported content type: 'text/html'");
    });

    it('should cache tags without mixing up repositories that share a tag name', async () => {
      setup();
      const first = firstValueFrom(service.getTag(repo('one'), 'latest'));
      flushDockerManifest('one', 'sha256:one');
      const tagOne = await first;

      expect(await firstValueFrom(service.getTag(repo('one'), 'latest'))).toBe(tagOne);

      const second = firstValueFrom(service.getTag(repo('two'), 'latest'));
      flushDockerManifest('two', 'sha256:two');
      const tagTwo = await second;
      expect(tagTwo).not.toBe(tagOne);
      expect(tagTwo.digest).toBe('sha256:two');
    });

    it('should load all tags of a repository', async () => {
      setup();
      const result = firstValueFrom(service.loadTags(repo('app')));
      backend.expectOne(BASE + 'app/tags/list').flush({ tags: ['v1', 'v2'] });
      for (const tag of ['v1', 'v2']) {
        manifestResponse(
          backend.expectOne(BASE + 'app/manifests/' + tag),
          RegistryUtils.MEDIA_DOCKER_MANIFEST,
          manifest('sha256:cfg-' + tag),
        );
      }
      for (const tag of ['v1', 'v2']) {
        backend.expectOne(BASE + 'app/blobs/sha256:cfg-' + tag).flush(configuration());
      }
      expect((await result).map((t) => t.name)).toEqual(['v1', 'v2']);
    });
  });

  describe('deleteTag', () => {
    async function loadedTag(repository: Repository) {
      const result = firstValueFrom(service.getTag(repository, 'latest'));
      manifestResponse(
        backend.expectOne(BASE + repository.getRelativePath() + '/manifests/latest'),
        RegistryUtils.MEDIA_DOCKER_MANIFEST,
        manifest(CONFIG_DIGEST),
        'sha256:todelete',
      );
      backend
        .expectOne(BASE + repository.getRelativePath() + '/blobs/' + CONFIG_DIGEST)
        .flush(configuration());
      return result;
    }

    it('should delete the manifest by digest with delete scope and report success', async () => {
      setup();
      const scopes: string[] = [];
      authorize = (scope) => (scopes.push(scope), of('Bearer t'));
      const tag = await loadedTag(repo('app', 'team'));

      const result = firstValueFrom(service.deleteTag(tag));
      const request = backend.expectOne(BASE + 'team/app/manifests/sha256:todelete');
      expect(request.request.method).toBe('DELETE');
      expect(request.request.headers.get('Authorization')).toBe('Bearer t');
      request.flush(null, { status: 202, statusText: 'Accepted' });

      expect(await result).toBe(true);
      expect(scopes).toContain('repository:team/app:delete');
    });

    it('should forget the cached tag after deleting it', async () => {
      setup();
      const repository = repo('app');
      const tag = await loadedTag(repository);
      const result = firstValueFrom(service.deleteTag(tag));
      backend
        .expectOne(BASE + 'app/manifests/sha256:todelete')
        .flush(null, { status: 202, statusText: 'Accepted' });
      await result;

      const reloaded = firstValueFrom(service.getTag(repository, 'latest'));
      manifestResponse(
        backend.expectOne(BASE + 'app/manifests/latest'),
        RegistryUtils.MEDIA_DOCKER_MANIFEST,
        manifest(CONFIG_DIGEST),
        'sha256:new',
      );
      backend.expectOne(BASE + 'app/blobs/' + CONFIG_DIGEST).flush(configuration());
      expect((await reloaded).digest).toBe('sha256:new');
    });

    it('should propagate registry errors such as disabled deletion', async () => {
      setup();
      const tag = await loadedTag(repo('app'));
      const result = firstValueFrom(service.deleteTag(tag));
      backend
        .expectOne(BASE + 'app/manifests/sha256:todelete')
        .flush('', { status: 405, statusText: 'Method Not Allowed' });
      await expect(result).rejects.toMatchObject({ status: 405 });
    });
  });

  it('should strip the protocol from the registry host', () => {
    setup();
    expect(service.registry).toBe('localhost:5000');
    expect(repo('app').registry).toBe('localhost:5000');
  });
});
