import { HttpErrorResponse } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { AuthProviderService } from '../../../auth/services/auth-provider.service';
import { RegistryService } from '../../../registry-core/services/registry.service';
import { ErrorEvent } from '../../../shared/models/error-event';
import { EventService } from '../../../shared/services/event.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  function create(count$: Observable<number>) {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ...TEST_PROVIDERS,
        { provide: AuthProviderService, useValue: { getCurrentUsername: () => 'anna' } },
        {
          provide: RegistryService,
          useValue: { registry: 'localhost:5000', getTotalRepositoryCount: () => count$ },
        },
      ],
    });
    const emitted: unknown[] = [];
    TestBed.inject(EventService).subject.subscribe((e) => emitted.push(e));
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance, emitted };
  }

  it('should show user, registry and repository count', () => {
    const { fixture, component } = create(of(7));
    expect(component.loading).toBe(false);
    expect(component.totalRepositoryCount).toBe(7);
    const text = (fixture.nativeElement as HTMLElement).textContent!;
    expect(text).toContain('anna');
    expect(text).toContain('localhost:5000');
    expect(text).toContain('7');
  });

  it('should report http errors with status and message', () => {
    const error = new HttpErrorResponse({ status: 403, statusText: 'Forbidden', url: 'x' });
    const { component, emitted } = create(throwError(() => error));
    expect(component.loading).toBe(false);
    expect(emitted.length).toBe(1);
    const event = emitted[0] as ErrorEvent;
    expect(event instanceof ErrorEvent).toBe(true);
    expect(event.message).toMatch(/^403: /);
    expect(event.cause).toBe(error);
  });

  it('should report plain errors and string errors', () => {
    expect((create(throwError(() => new Error('boom'))).emitted[0] as ErrorEvent).message).toBe(
      'boom',
    );
    TestBed.resetTestingModule();
    expect((create(throwError(() => 'text')).emitted[0] as ErrorEvent).message).toBe('text');
  });
});
