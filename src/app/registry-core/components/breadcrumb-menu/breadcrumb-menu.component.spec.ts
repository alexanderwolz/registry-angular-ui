import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { Repository } from '../../models/repository';
import { RegistryService } from '../../services/registry.service';
import { BreadcrumbMenuComponent } from './breadcrumb-menu.component';

describe('BreadcrumbMenuComponent', () => {
  function create(title: string, params: Record<string, string>, namespace: string | null = null) {
    TestBed.configureTestingModule({
      imports: [BreadcrumbMenuComponent],
      providers: [
        ...TEST_PROVIDERS,
        { provide: ActivatedRoute, useValue: { snapshot: { data: { title }, params } } },
        {
          provide: RegistryService,
          useValue: {
            createRepository: (ns: string[], name: string) =>
              new Repository('http://localhost', ns, name),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(BreadcrumbMenuComponent);
    fixture.componentInstance.namespace = namespace;
    fixture.detectChanges();
    return fixture;
  }

  const view = (c: BreadcrumbMenuComponent) =>
    c.segments.map((s) => [s.name, s.routerLink ?? null, s.active ?? null]);

  it('should show the namespace of the repository overview as active', () => {
    const { componentInstance: c } = create('repositories', {}, 'team');
    expect(view(c)).toEqual([
      ['Repositories', null, null],
      ['team', null, true],
    ]);
  });

  it('should fall back to the default namespace', () => {
    const { componentInstance: c } = create('repositories', {});
    expect(c.segments[1].name).toBe(Repository.DEFAULT_NAMESPACE);
  });

  it('should link back to the namespace from a repository, including nested segments', () => {
    const { componentInstance: c } = create('repository', { namespaces: 'team/sub', name: 'app' });
    expect(view(c)).toEqual([
      ['Repositories', null, null],
      ['team', '/repositories', null],
      ['sub', null, null],
      ['app', null, true],
    ]);
    expect(c.segments[1].queryParams).toEqual({ namespace: 'team' });
  });

  it('should build the trail for the tag overview', () => {
    const { componentInstance: c } = create('tags', { namespaces: 'team', name: 'app' });
    expect(view(c)).toEqual([
      ['Repositories', null, null],
      ['team', '/repositories', null],
      ['app', '/repositories/team/app', null],
      ['Tags', null, true],
    ]);
  });

  it('should build the trail for a tag', () => {
    const { componentInstance: c } = create('tag', { namespaces: 'team', name: 'app', tag: 'v1' });
    expect(view(c).slice(2)).toEqual([
      ['app', '/repositories/team/app', null],
      ['Tags', '/repositories/team/app/tags', null],
      ['v1', null, true],
    ]);
  });

  it('should build the trail for an image', () => {
    const { componentInstance: c } = create('image', {
      namespaces: 'team',
      name: 'app',
      tag: 'v1',
      image: 'abc',
    });
    expect(view(c).slice(2)).toEqual([
      ['app', '/repositories/team/app', null],
      ['Tags', '/repositories/team/app/tags', null],
      ['v1', '/repositories/team/app/tags/v1', null],
      ['abc', null, true],
    ]);
  });

  it('should prefer an explicit namespace over the one in the route and update on changes', () => {
    const fixture = create('repository', { namespaces: 'team', name: 'app' });
    fixture.componentInstance.namespace = 'other';
    fixture.componentInstance.ngOnChanges();
    expect(fixture.componentInstance.segments[1].name).toBe('other');
  });

  it('should show no trail for unknown pages', () => {
    expect(create('unknown', {}).componentInstance.segments).toEqual([]);
  });
});
