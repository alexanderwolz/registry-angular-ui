import { HttpClient } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { jwt } from 'src/testing/fixtures';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { InfoEvent } from '../../shared/models/info-event';
import { EventService } from '../../shared/services/event.service';
import { StorageService } from '../../shared/services/storage.service';
import { Scope } from '../models/scope';
import { Type } from './auth-provider';
import { BasicAuthProvider } from './basic-auth-provider';
import { EmptyAuthProvider } from './empty-auth-provider';
import { TokenAuthProvider } from './token-auth-provider';

const SERVER = 'http://localhost:5000/v2/';
const SECRET = 'a-secret';
const scope = new Scope('repository', 'team/app', ['pull']);

describe('AuthProviders', () => {
  let router: Router;
  let storage: StorageService;
  let events: EventService;
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [...TEST_PROVIDERS] });
    router = TestBed.inject(Router);
    storage = TestBed.inject(StorageService);
    events = TestBed.inject(EventService);
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    backend.verify();
    vi.useRealTimers();
  });

  describe('EmptyAuthProvider', () => {
    let provider: EmptyAuthProvider;
    beforeEach(() => (provider = new EmptyAuthProvider(router, storage, events, SECRET)));

    it('should always be authenticated', () => {
      expect(provider.getType()).toBe(Type.EMPTY);
      expect(provider.isAuthenticated()).toBe(true);
    });

    it('should log in without any request and grant an empty authorization', async () => {
      expect(await firstValueFrom(provider.login('anna', 'pw'))).toBe('anna');
      expect(provider.getUsername()).toBe('anna');
      expect(await firstValueFrom(provider.getAuthorizationFor(scope))).toBe('');
    });
  });

  describe('BasicAuthProvider', () => {
    let provider: BasicAuthProvider;
    beforeEach(
      () => (provider = new BasicAuthProvider(router, storage, events, SECRET, http, SERVER)),
    );

    it('should not be authenticated before login and refuse authorizations', async () => {
      expect(provider.isAuthenticated()).toBe(false);
      expect(provider.getUsername()).toBe('Unknown User');
      await expect(firstValueFrom(provider.getAuthorizationFor(scope))).rejects.toThrow(
        'No user logged in',
      );
    });

    it('should verify credentials against the registry on login', async () => {
      const result = firstValueFrom(provider.login('anna', 'pw'));
      const request = backend.expectOne(SERVER);
      expect(request.request.headers.get('Authorization')).toBe('Basic ' + btoa('anna:pw'));
      request.flush({});
      expect(await result).toBe('anna');
      expect(provider.isAuthenticated()).toBe(true);
      expect(provider.getUsername()).toBe('anna');
    });

    it('should not store credentials in plain text', async () => {
      const result = firstValueFrom(provider.login('anna', 'pw'));
      backend.expectOne(SERVER).flush({});
      await result;
      const stored = storage.getStringFromLocalStorage('auth')!;
      expect(stored).toBeTruthy();
      expect(stored).not.toContain('anna');
      expect(stored).not.toContain(btoa('anna:pw'));
    });

    it('should not log in when the registry rejects the credentials', async () => {
      const result = firstValueFrom(provider.login('anna', 'wrong'));
      backend.expectOne(SERVER).flush('denied', { status: 401, statusText: 'Unauthorized' });
      await expect(result).rejects.toBeTruthy();
      expect(provider.isAuthenticated()).toBe(false);
      expect(storage.existsInLocalStorage('auth')).toBe(false);
    });

    it('should authorize with the stored basic credentials', async () => {
      const login = firstValueFrom(provider.login('anna', 'pw'));
      backend.expectOne(SERVER).flush({});
      await login;
      expect(await firstValueFrom(provider.getAuthorizationFor(scope))).toBe(
        'Basic ' + btoa('anna:pw'),
      );
    });

    it('should drop the session and announce it once the token is expired', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      const login = firstValueFrom(provider.login('anna', 'pw'));
      backend.expectOne(SERVER).flush({});
      await login;

      const received: unknown[] = [];
      events.subject.subscribe((e) => received.push(e));

      vi.setSystemTime(new Date('2024-01-01T01:59:00Z'));
      expect(provider.isAuthenticated()).toBe(true);

      vi.setSystemTime(new Date('2024-01-01T02:00:01Z'));
      expect(provider.isAuthenticated()).toBe(false);
      expect(storage.existsInLocalStorage('auth')).toBe(false);
      expect(received.length).toBe(1);
      expect(received[0] instanceof InfoEvent).toBe(true);
    });

    it('should clear session and caches on logout and go to the login page', async () => {
      const login = firstValueFrom(provider.login('anna', 'pw'));
      backend.expectOne(SERVER).flush({});
      await login;
      const cache = storage.getArrayCache<string>('c');
      cache.set(['x']);

      provider.logout();

      expect(provider.isAuthenticated()).toBe(false);
      expect(cache.values).toEqual([]);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should not be able to read a session encrypted with another secret', async () => {
      const login = firstValueFrom(provider.login('anna', 'pw'));
      backend.expectOne(SERVER).flush({});
      await login;
      const other = new BasicAuthProvider(router, storage, events, 'other-secret', http, SERVER);
      expect(() => other.isAuthenticated()).toThrow();
    });
  });

  describe('TokenAuthProvider', () => {
    const REALM = 'http://auth.local/token';
    let provider: TokenAuthProvider;

    beforeEach(() => {
      provider = new TokenAuthProvider(
        router,
        storage,
        events,
        SECRET,
        REALM,
        'registry-service',
        http,
      );
    });

    async function loginAs(name: string) {
      const login = firstValueFrom(provider.login(name, 'pw'));
      backend.expectOne((r) => r.url === REALM).flush({ token: 'unused' });
      await login;
    }

    function expectTokenRequest(token: string, access: unknown[] = [{ type: 'repository' }]) {
      const request = backend.expectOne((r) => r.url === REALM);
      return {
        request,
        flush: () =>
          request.flush({ token: jwt({ access, exp: Math.floor(Date.now() / 1000) + 300 }) }),
      };
    }

    it('should log in against the token server with the registry service id', async () => {
      const login = firstValueFrom(provider.login('anna', 'pw'));
      const request = backend.expectOne((r) => r.url === REALM);
      expect(request.request.params.get('service')).toBe('registry-service');
      expect(request.request.params.has('scope')).toBe(false);
      request.flush({ token: 'unused' });
      expect(await login).toBe('anna');
      expect(provider.getType()).toBe(Type.TOKEN);
    });

    it('should request a bearer token for the scope', async () => {
      await loginAs('anna');
      const result = firstValueFrom(provider.getAuthorizationFor(scope));
      const { request, flush } = expectTokenRequest('t');
      expect(request.request.params.get('scope')).toBe('repository:team/app:pull');
      expect(request.request.headers.get('Authorization')).toBe('Basic ' + btoa('anna:pw'));
      flush();
      expect(await result).toMatch(/^Bearer .+\..+\..+$/);
    });

    it('should reuse a still valid token for the same scope only', async () => {
      await loginAs('anna');
      const first = firstValueFrom(provider.getAuthorizationFor(scope));
      expectTokenRequest('t').flush();
      const firstToken = await first;

      expect(await firstValueFrom(provider.getAuthorizationFor(scope))).toBe(firstToken);

      const other = firstValueFrom(
        provider.getAuthorizationFor(new Scope('repository', 'other', ['pull'])),
      );
      expectTokenRequest('t').flush();
      expect(await other).toMatch(/^Bearer /);
    });

    it('should fetch a new token when the cached one is about to expire', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      await loginAs('anna');

      const first = firstValueFrom(provider.getAuthorizationFor(scope));
      expectTokenRequest('t').flush();
      await first;

      vi.setSystemTime(new Date('2024-01-01T00:04:58Z')); // < 5s before expiry (300s)
      const second = firstValueFrom(provider.getAuthorizationFor(scope));
      expectTokenRequest('t').flush();
      await second;
    });

    it('should fail when the token grants no access to the scope', async () => {
      await loginAs('anna');
      const result = firstValueFrom(provider.getAuthorizationFor(scope));
      expectTokenRequest('t', []).flush();
      await expect(result).rejects.toThrow('No Access items');
    });

    it('should forget cached tokens on logout', async () => {
      await loginAs('anna');
      const first = firstValueFrom(provider.getAuthorizationFor(scope));
      expectTokenRequest('t').flush();
      await first;

      provider.logout();
      await loginAs('anna');

      const again = firstValueFrom(provider.getAuthorizationFor(scope));
      expectTokenRequest('t').flush();
      await again;
    });
  });
});
