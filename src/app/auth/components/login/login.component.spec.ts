import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { AuthProvider } from '../../providers/auth-provider';
import { AuthProviderService } from '../../services/auth-provider.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let navigate: ReturnType<typeof vi.spyOn>;

  function create(
    provider: Partial<AuthProvider> | null,
    options: { error?: Error | null; queryParams?: Record<string, string> } = {},
  ) {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        ...TEST_PROVIDERS,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: options.queryParams ?? {} } },
        },
        {
          provide: AuthProviderService,
          useValue: { getAuthProvider: () => provider, getError: () => options.error ?? null },
        },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    return fixture;
  }

  const provider = (
    login: () => Observable<string>,
    authenticated = false,
  ): Partial<AuthProvider> => ({
    isAuthenticated: () => authenticated,
    login,
  });

  function submit(fixture: ReturnType<typeof create>, username = 'anna', password = 'pw') {
    fixture.componentInstance.loginForm.setValue({ username, password });
    fixture.componentInstance.onSubmit();
    fixture.detectChanges();
  }

  it('should disable the form and show the reason when no provider could be resolved', () => {
    const fixture = create(null, {
      error: new Error('Host seems to be down. Check CORS settings.'),
    });
    expect(fixture.componentInstance.loginForm.disabled).toBe(true);
    expect(fixture.componentInstance.errorMessage()).toBe(
      'Host seems to be down. Check CORS settings.',
    );
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Host seems to be down');
  });

  it('should explain a missing provider even without a recorded error', () => {
    expect(create(null).componentInstance.errorMessage()).toContain('try page refresh');
  });

  it('should skip the login for users who are already authenticated', () => {
    create(provider(() => of('anna'), true));
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('should not submit invalid input', () => {
    const login = vi.fn(() => of('anna'));
    const fixture = create(provider(login));
    submit(fixture, '', '');
    expect(fixture.componentInstance.submitted()).toBe(true);
    expect(login).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Username is required');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Password is required');
  });

  it('should log in and continue to the start page', () => {
    const login = vi.fn(() => of('anna'));
    submit(create(provider(login)));
    expect(login).toHaveBeenCalledWith('anna', 'pw');
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('should continue to the page the user was redirected from', () => {
    submit(
      create(
        provider(() => of('anna')),
        { queryParams: { redirect: '/repositories/team/app' } },
      ),
    );
    expect(navigate).toHaveBeenCalledWith(['/repositories/team/app']);
  });

  it('should show the error of a failed login and allow another try', () => {
    const fixture = create(provider(() => throwError(() => new Error('Unauthorized'))));
    submit(fixture);
    expect(fixture.componentInstance.errorMessage()).toBe('Unauthorized');
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should join the messages reported by the registry', () => {
    const error = new HttpErrorResponse({
      status: 401,
      error: { errors: [{ message: 'one' }, { message: 'two' }] },
    });
    const fixture = create(provider(() => throwError(() => error)));
    submit(fixture);
    expect(fixture.componentInstance.errorMessage()).toBe('one | two');
  });
});
