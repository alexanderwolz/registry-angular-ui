import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { repository, tag } from 'src/testing/fixtures';
import { TEST_PROVIDERS, routeParams } from 'src/testing/test-providers';
import { Tag } from '../../../registry-core/models/tag';
import { RegistryService } from '../../../registry-core/services/registry.service';
import { TagOverviewComponent } from './tag-overview.component';

describe('TagOverviewComponent', () => {
  const repo = repository('app', 'team');
  const tags = [tag('v1', repo), tag('v2', repo), tag('v3', repo)];

  function create(
    tags$: Observable<Tag[]>,
    params: Record<string, string> = { namespaces: 'team', name: 'app' },
  ) {
    TestBed.configureTestingModule({
      imports: [TagOverviewComponent],
      providers: [
        ...TEST_PROVIDERS,
        routeParams(params),
        {
          provide: RegistryService,
          useValue: { createRepository: () => repo, loadTags: () => tags$ },
        },
      ],
    });
    const fixture = TestBed.createComponent(TagOverviewComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('should load the tags of the repository from the route', () => {
    const c = create(of(tags));
    expect(c.repository()).toBe(repo);
    expect(c.tagContainers().map((t) => t.tag.name)).toEqual(['v1', 'v2', 'v3']);
    expect(c.tagContainers().every((t) => !t.isSelected)).toBe(true);
    expect(c.loading()).toBe(false);
  });

  it('should require the repository name', () => {
    expect(() => create(of([]), { namespaces: 'team' })).toThrow(/name/);
  });

  it('should select and deselect all tags', () => {
    const c = create(of(tags));
    c.updateAllSelections(true);
    expect(c.selection().length).toBe(3);
    expect(c.tagContainers().every((t) => t.isSelected)).toBe(true);
    c.updateAllSelections(false);
    expect(c.selection()).toEqual([]);
    expect(c.tagContainers().some((t) => t.isSelected)).toBe(false);
  });

  it('should track single selections and the select-all state', () => {
    const c = create(of(tags));
    c.tagContainers()[0].isSelected = true;
    c.updateSelection(c.tagContainers()[0]);
    expect(c.selection().map((t) => t.name)).toEqual(['v1']);
    expect(c.selectAll).toBe(false);

    c.tagContainers()[1].isSelected = true;
    c.updateSelection(c.tagContainers()[1]);
    c.tagContainers()[2].isSelected = true;
    c.updateSelection(c.tagContainers()[2]);
    expect(c.selectAll).toBe(true);

    c.tagContainers()[1].isSelected = false;
    c.updateSelection(c.tagContainers()[1]);
    expect(c.selection().map((t) => t.name)).toEqual(['v1', 'v3']);
    expect(c.selectAll).toBe(false);
  });

  it('should not add a tag twice', () => {
    const c = create(of(tags));
    c.tagContainers()[0].isSelected = true;
    c.updateSelection(c.tagContainers()[0]);
    c.updateSelection(c.tagContainers()[0]);
    expect(c.selection().length).toBe(1);
  });

  it('should say that a repository does not exist on 404', () => {
    const c = create(throwError(() => new HttpErrorResponse({ status: 404 })));
    expect(c.errorMessage()).toBe("Repository 'team/app' does not exist!");
    expect(c.loading()).toBe(false);
  });

  it('should show other http errors with their status', () => {
    expect(create(throwError(() => new HttpErrorResponse({ status: 500 }))).errorMessage()).toMatch(
      /^Error 500:/,
    );
  });

  it('should show messages of other errors', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(create(throwError(() => new Error('boom'))).errorMessage()).toBe('boom');
  });
});
