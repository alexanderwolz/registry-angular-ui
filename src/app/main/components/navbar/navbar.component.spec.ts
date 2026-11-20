import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { Type } from '../../../auth/providers/auth-provider';
import { AuthProviderService } from '../../../auth/services/auth-provider.service';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  async function create(type: Type | null, url = '/') {
    TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        ...TEST_PROVIDERS,
        {
          provide: AuthProviderService,
          useValue: {
            getCurrentUsername: () => 'anna',
            getAuthProvider: () => (type === null ? null : { getType: () => type }),
          },
        },
      ],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    return { fixture, router };
  }

  const active = (c: NavbarComponent) => c.segments().map((s) => [s.name, s.active]);

  it('should mark home as active on the start page', async () => {
    const { fixture } = await create(Type.BASIC);
    expect(active(fixture.componentInstance)).toEqual([
      ['Home', true],
      ['Repositories', false],
    ]);
  });

  it('should mark repositories as active below /repositories', async () => {
    const { fixture } = await create(Type.BASIC, '/repositories/team/app');
    expect(active(fixture.componentInstance)).toEqual([
      ['Home', false],
      ['Repositories', true],
    ]);
  });

  it('should follow the navigation to the page that was actually opened', async () => {
    const { fixture, router } = await create(Type.BASIC);
    await router.navigateByUrl('/repositories');
    expect(active(fixture.componentInstance)).toEqual([
      ['Home', false],
      ['Repositories', true],
    ]);
    await router.navigateByUrl('/');
    expect(active(fixture.componentInstance)).toEqual([
      ['Home', true],
      ['Repositories', false],
    ]);
  });

  it('should render the active state and links', async () => {
    const { fixture } = await create(Type.BASIC, '/repositories');
    fixture.detectChanges();
    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a.nav-link'));
    const repositories = links.find((a) => a.textContent!.includes('Repositories'))!;
    expect(repositories.classList.contains('active')).toBe(true);
    expect(repositories.getAttribute('href')).toBe('/repositories');
  });

  it('should show the user menu with the user name when authentication is active', async () => {
    const { fixture } = await create(Type.TOKEN);
    const text = (fixture.nativeElement as HTMLElement).textContent!;
    expect(fixture.componentInstance.isAuthActive).toBe(true);
    expect(text).toContain('anna');
    expect(text).toContain('Logout');
  });

  it('should hide the user menu for registries without authentication', async () => {
    const { fixture } = await create(Type.EMPTY);
    expect(fixture.componentInstance.isAuthActive).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Logout');
  });

  it('should stop listening to the router when destroyed', async () => {
    const { fixture, router } = await create(Type.BASIC);
    const before = fixture.componentInstance.segments();
    fixture.destroy();
    await router.navigateByUrl('/repositories');
    expect(fixture.componentInstance.segments()).toBe(before);
  });
});
