import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { AuthProviderService } from '../../services/auth-provider.service';
import { LogoutComponent } from './logout.component';

describe('LogoutComponent', () => {
  function create(provider: { logout: () => void } | null) {
    TestBed.configureTestingModule({
      declarations: [LogoutComponent],
      providers: [
        ...TEST_PROVIDERS,
        { provide: AuthProviderService, useValue: { getAuthProvider: () => provider } },
      ],
    });
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    TestBed.createComponent(LogoutComponent).detectChanges();
    return navigate;
  }

  it('should log the user out and go to the login page', () => {
    const logout = vi.fn();
    const navigate = create({ logout });
    expect(logout).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should still go to the login page without a provider', () => {
    expect(create(null)).toHaveBeenCalledWith(['/login']);
  });
});
