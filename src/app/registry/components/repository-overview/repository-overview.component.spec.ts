import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';
import { repository } from 'src/testing/fixtures';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { AuthProviderService } from '../../../auth/services/auth-provider.service';
import { Repository } from '../../../registry-core/models/repository';
import { RegistryService } from '../../../registry-core/services/registry.service';
import { RepositoryOverviewComponent } from './repository-overview.component';

describe('RepositoryOverviewComponent', () => {
  const repos = new Map<string, Repository[]>([
    ['anna', [repository('mine', 'anna')]],
    ['team', [repository('a', 'team'), repository('b', 'team')]],
    ['alpha', [repository('c', 'alpha')]],
  ]);

  function create(
    result$: Observable<Map<string, Repository[]>>,
    queryParams: Record<string, string> = {},
  ) {
    TestBed.configureTestingModule({
      imports: [RepositoryOverviewComponent],
      providers: [
        ...TEST_PROVIDERS,
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams, params: {}, data: {} } } },
        { provide: AuthProviderService, useValue: { getCurrentUsername: () => 'anna' } },
        {
          provide: RegistryService,
          useValue: { getAllRepositoriesMappedByNamespace: () => result$ },
        },
      ],
    });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(RepositoryOverviewComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should show the repositories of the own namespace first', () => {
    const { componentInstance: c } = create(of(repos));
    expect(c.currentNamespace()).toBe('anna');
    expect(c.selectedRepositories().map((r) => r.name)).toEqual(['mine']);
    expect(c.loading()).toBe(false);
  });

  it('should list the other namespaces sorted and without the own one', () => {
    expect(create(of(repos)).componentInstance.otherNamespaces()).toEqual(['alpha', 'team']);
  });

  it('should preselect the namespace given as query parameter', () => {
    const { componentInstance: c } = create(of(repos), { namespace: 'team' });
    expect(c.currentNamespace()).toBe('team');
    expect(c.selectedRepositories().map((r) => r.name)).toEqual(['a', 'b']);
  });

  it('should switch the namespace and fall back to the own one', () => {
    const { componentInstance: c } = create(of(repos));
    c.setNamespace('alpha');
    expect(c.selectedRepositories().map((r) => r.name)).toEqual(['c']);
    c.setNamespace('');
    expect(c.currentNamespace()).toBe('anna');
  });

  it('should show nothing for an unknown namespace', () => {
    const { componentInstance: c } = create(of(repos));
    c.setNamespace('unknown');
    expect(c.selectedRepositories()).toEqual([]);
  });

  it('should be loading until the repositories arrived', () => {
    const subject = new Subject<Map<string, Repository[]>>();
    const { componentInstance: c } = create(subject);
    expect(c.loading()).toBe(true);
    subject.next(repos);
    expect(c.loading()).toBe(false);
  });

  it('should show error messages of plain errors', () => {
    const { componentInstance: c } = create(throwError(() => new Error('No user logged in')));
    expect(c.loading()).toBe(false);
    expect(c.errorMessage()).toBe('No user logged in');
  });

  it('should join the messages the registry reports', () => {
    const error = new HttpErrorResponse({
      status: 401,
      error: { errors: [{ message: 'first' }, { message: 'second' }] },
    });
    expect(create(throwError(() => error)).componentInstance.errorMessage()).toBe('first second ');
  });

  it('should fall back to the http error message', () => {
    const error = new HttpErrorResponse({ status: 500, error: {} });
    expect(create(throwError(() => error)).componentInstance.errorMessage()).toContain('500');
  });
});
