import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { AuthProvider } from '../providers/auth-provider';
import { AuthProviderService } from '../services/auth-provider.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let router: Router;
  let navigate: ReturnType<typeof vi.fn>;
  let provider: AuthProvider | null;

  beforeEach(() => {
    provider = null;
    TestBed.configureTestingModule({
      providers: [
        ...TEST_PROVIDERS,
        { provide: AuthProviderService, useValue: { getAuthProvider: () => provider } },
      ],
    });
    router = TestBed.inject(Router);
    navigate = vi.fn().mockResolvedValue(false);
    router.navigate = navigate as unknown as Router['navigate'];
  });

  const run = (url: string) =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );

  it('should let authenticated users pass', () => {
    provider = { isAuthenticated: () => true } as AuthProvider;
    expect(run('/repos')).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should send unauthenticated users to the login page and remember the target', () => {
    provider = { isAuthenticated: () => false } as AuthProvider;
    run('/repos/team/app');
    expect(navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { redirect: '/repos/team/app' },
    });
  });

  it('should not add a redirect for the start page', () => {
    run('/');
    expect(navigate).toHaveBeenCalledWith(['/login'], {});
  });

  it('should treat a missing provider as unauthenticated', () => {
    provider = null;
    run('/x');
    expect(navigate).toHaveBeenCalled();
  });
});
