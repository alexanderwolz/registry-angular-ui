import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { Type } from '../../../auth/providers/auth-provider';
import { AuthProviderService } from '../../../auth/services/auth-provider.service';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  const events = new Subject<unknown>();
  let url: string;

  function create(type: Type | null) {
    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ...TEST_PROVIDERS,
        {
          provide: Router,
          useValue: {
            get url() {
              return url;
            },
            events,
          },
        },
        {
          provide: AuthProviderService,
          useValue: {
            getCurrentUsername: () => 'anna',
            getAuthProvider: () => (type === null ? null : { getType: () => type }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => (url = '/'));

  it('should mark home as active on the start page', () => {
    const { componentInstance: navbar } = create(Type.BASIC);
    expect(navbar.segments.map((s) => [s.name, s.active])).toEqual([
      ['Home', true],
      ['Repositories', false],
    ]);
  });

  it('should mark repositories as active below /repositories and follow navigation', () => {
    url = '/repositories/team/app';
    const fixture = create(Type.BASIC);
    expect(fixture.componentInstance.segments.map((s) => s.active)).toEqual([false, true]);

    url = '/';
    events.next(new NavigationStart(1, '/'));
    expect(fixture.componentInstance.segments.map((s) => s.active)).toEqual([true, false]);
  });

  it('should ignore other router events', () => {
    const fixture = create(Type.BASIC);
    const before = fixture.componentInstance.segments;
    events.next({});
    expect(fixture.componentInstance.segments).toBe(before);
  });

  it('should show the user menu with the user name when authentication is active', () => {
    const fixture = create(Type.TOKEN);
    expect(fixture.componentInstance.isAuthActive).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('anna');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Logout');
  });

  it('should hide the user menu for registries without authentication', () => {
    const fixture = create(Type.EMPTY);
    expect(fixture.componentInstance.isAuthActive).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Logout');
  });
});
