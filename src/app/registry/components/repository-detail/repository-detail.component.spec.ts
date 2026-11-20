import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { repository, tag } from 'src/testing/fixtures';
import { TEST_PROVIDERS, routeParams } from 'src/testing/test-providers';
import { RegistryService } from '../../../registry-core/services/registry.service';
import { RepositoryDetailComponent } from './repository-detail.component';

describe('RepositoryDetailComponent', () => {
  const repo = repository('app', 'team');
  const names = (n: number) => Array.from({ length: n }, (_, i) => 'v' + (i + 1));

  function create(
    tagNames$: Observable<string[]>,
    params: Record<string, string> = { namespaces: 'team', name: 'app' },
  ) {
    const getTag = vi.fn((_: unknown, name: string) => of(tag(name, repo)));
    TestBed.configureTestingModule({
      imports: [RepositoryDetailComponent],
      providers: [
        ...TEST_PROVIDERS,
        routeParams(params),
        {
          provide: RegistryService,
          useValue: { createRepository: () => repo, loadTagNames: () => tagNames$, getTag },
        },
      ],
    });
    const fixture = TestBed.createComponent(RepositoryDetailComponent);
    fixture.detectChanges();
    return { c: fixture.componentInstance, getTag, fixture };
  }

  it('should show all tags of a small repository without a "show more" line', () => {
    const { c } = create(of(names(3)));
    expect(c.totalTagCount()).toBe(3);
    expect(c.tags().map((t) => t.name)).toEqual(['v1', 'v2', 'v3']);
    expect(c.showMoreLine()).toBe(false);
    expect(c.loading()).toBe(false);
  });

  it('should only load the first five tags of a big repository and offer to show more', () => {
    const { c, getTag } = create(of(names(12)));
    expect(c.totalTagCount()).toBe(12);
    expect(getTag).toHaveBeenCalledTimes(5);
    expect(c.tags().length).toBe(5);
    expect(c.showMoreLine()).toBe(true);
  });

  it('should not offer more for exactly five tags', () => {
    expect(create(of(names(5))).c.showMoreLine()).toBe(false);
  });

  it('should handle repositories without tags', () => {
    const { c, getTag } = create(of([]));
    expect(getTag).not.toHaveBeenCalled();
    expect(c.tags()).toEqual([]);
    expect(c.loading()).toBe(false);
  });

  it('should require the repository name', () => {
    expect(() => create(of([]), {})).toThrow(/name/);
  });

  it('should say that a repository does not exist on 404', () => {
    const { c } = create(throwError(() => new HttpErrorResponse({ status: 404 })));
    expect(c.errorMessage()).toBe("Repository 'team/app' does not exist!");
  });

  it('should show other errors', () => {
    expect(
      create(throwError(() => new HttpErrorResponse({ status: 503 }))).c.errorMessage(),
    ).toMatch(/^Error 503:/);
    TestBed.resetTestingModule();
    expect(create(throwError(() => 'plain')).c.errorMessage()).toBe('plain');
  });
});
