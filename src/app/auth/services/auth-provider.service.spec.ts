import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { Type } from '../providers/auth-provider';
import { AuthProviderService } from './auth-provider.service';

const URL = 'http://localhost:5000/v2/';

describe('AuthProviderService', () => {
  let service: AuthProviderService;
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [...TEST_PROVIDERS] });
    service = TestBed.inject(AuthProviderService);
    backend = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => backend.verify());

  function resolveWith(status: number, headers: Record<string, string> = {}) {
    const result = firstValueFrom(service.resolveAuthProvider());
    const request = backend.expectOne(URL);
    expect(request.request.method).toBe('HEAD');
    if (status === 200) {
      request.flush(null);
    } else {
      request.flush('', { status, statusText: 'x', headers });
    }
    return result;
  }

  it('should have no provider before resolving', () => {
    expect(service.getAuthProvider()).toBeNull();
    expect(service.getError()).toBeNull();
    expect(service.getCurrentUsername()).toBe('Unknown User');
  });

  it('should use no authentication for an open registry', async () => {
    const provider = await resolveWith(200);
    expect(provider?.getType()).toBe(Type.EMPTY);
    expect(service.getAuthProvider()).toBe(provider);
  });

  it('should use basic auth when the registry asks for it', async () => {
    const provider = await resolveWith(401, { 'www-authenticate': 'Basic realm="Registry"' });
    expect(provider?.getType()).toBe(Type.BASIC);
    expect(service.getError()).toBeNull();
  });

  it('should use token auth and parse realm and service from the bearer challenge', async () => {
    const provider = await resolveWith(401, {
      'www-authenticate':
        'Bearer realm="https://auth.example.com/token",service="registry.example.com"',
    });
    expect(provider?.getType()).toBe(Type.TOKEN);

    const login = firstValueFrom(provider!.login('anna', 'pw'));
    const request = backend.expectOne((r) => r.url === 'https://auth.example.com/token');
    expect(request.request.params.get('service')).toBe('registry.example.com');
    request.flush({});
    await login;
  });

  it('should report an unusable bearer challenge', async () => {
    expect(await resolveWith(401, { 'www-authenticate': 'Bearer' })).toBeNull();
    expect(service.getError()?.message).toContain('could not be parsed');
  });

  it('should report unsupported authentication schemes', async () => {
    expect(await resolveWith(401, { 'www-authenticate': 'Negotiate' })).toBeNull();
    expect(service.getError()?.message).toBe("Unsupported Authenticate: 'Negotiate'");
  });

  it('should point at CORS when the challenge header is not readable', async () => {
    expect(await resolveWith(401)).toBeNull();
    expect(service.getError()?.message).toContain("'www-authenticate'");
  });

  it('should report an unreachable host', async () => {
    const result = firstValueFrom(service.resolveAuthProvider());
    backend.expectOne(URL).error(new ProgressEvent('error'));
    expect(await result).toBeNull();
    expect(service.getError()?.message).toContain('Host seems to be down');
  });

  it('should keep any other error', async () => {
    expect(await resolveWith(500)).toBeNull();
    expect(service.getError()).toBeTruthy();
  });

  it('should reset the provider when resolving again', async () => {
    await resolveWith(200);
    await resolveWith(500);
    expect(service.getAuthProvider()).toBeNull();
  });
});
