import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthProviderService } from '../services/auth-provider.service';
import { errorInterceptor } from './error.interceptor';
import { REGISTRY_HOST } from '../../app.tokens';

const REGISTRY = 'http://localhost:5000';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let logout: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    logout = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: REGISTRY_HOST, useValue: REGISTRY },
        { provide: AuthProviderService, useValue: { getAuthProvider: () => ({ logout }) } },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  function fail(url: string, status: number, headers: Record<string, string> = {}) {
    let error: { status: number } | undefined;
    http.get(url, { headers }).subscribe({ error: (e) => (error = e) });
    backend.expectOne(url).flush('', { status, statusText: 'x' });
    return error;
  }

  it('should log out when an authorized request is rejected', () => {
    const error = fail(REGISTRY + '/v2/repo/tags/list', 401, { authorization: 'Bearer x' });
    expect(logout).toHaveBeenCalledOnce();
    expect(error?.status).toBe(401);
  });

  it('should not log out for unauthorized requests', () => {
    fail(REGISTRY + '/v2/repo/tags/list', 401);
    expect(logout).not.toHaveBeenCalled();
  });

  it('should ignore rejections of the plain registry url that is used to detect the provider', () => {
    fail(REGISTRY + '/v2/', 401, { authorization: 'Basic x' });
    expect(logout).not.toHaveBeenCalled();
  });

  it('should keep other errors untouched and not log out', () => {
    expect(fail(REGISTRY + '/v2/x', 404, { authorization: 'Basic x' })?.status).toBe(404);
    expect(fail(REGISTRY + '/v2/y', 500, { authorization: 'Basic x' })?.status).toBe(500);
    expect(logout).not.toHaveBeenCalled();
  });

  it('should pass successful responses through', () => {
    let body: unknown;
    http.get(REGISTRY + '/v2/z').subscribe((b) => (body = b));
    backend.expectOne(REGISTRY + '/v2/z').flush({ ok: true });
    expect(body).toEqual({ ok: true });
  });
});
