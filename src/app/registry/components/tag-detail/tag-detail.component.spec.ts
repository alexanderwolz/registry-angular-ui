import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { repository, tag } from 'src/testing/fixtures';
import { TEST_PROVIDERS, routeParams } from 'src/testing/test-providers';
import { Tag } from '../../../registry-core/models/tag';
import { RegistryService } from '../../../registry-core/services/registry.service';
import { TagDetailComponent } from './tag-detail.component';

describe('TagDetailComponent', () => {
  function create(
    tag$: Observable<Tag>,
    params: Record<string, string> = { namespaces: 'team', name: 'app', tag: 'v1' },
  ) {
    const getTag = vi.fn(() => tag$);
    TestBed.configureTestingModule({
      imports: [TagDetailComponent],
      providers: [
        ...TEST_PROVIDERS,
        routeParams(params),
        {
          provide: RegistryService,
          useValue: { createRepository: () => repository('app', 'team'), getTag },
        },
      ],
    });
    const fixture = TestBed.createComponent(TagDetailComponent);
    fixture.detectChanges();
    return { c: fixture.componentInstance, getTag };
  }

  it('should load the tag given by the route', () => {
    const { c, getTag } = create(of(tag('v1', repository('app', 'team'))));
    expect(getTag).toHaveBeenCalledWith(expect.anything(), 'v1');
    expect(c.tag()?.name).toBe('v1');
    expect(c.loading()).toBe(false);
  });

  it('should require name and tag', () => {
    expect(() => create(of(tag()), { tag: 'v1' })).toThrow(/'name'/);
    TestBed.resetTestingModule();
    expect(() => create(of(tag()), { name: 'app' })).toThrow(/'tag'/);
  });

  it('should show the http status instead of overwriting it', () => {
    const { c } = create(throwError(() => new HttpErrorResponse({ status: 404 })));
    expect(c.errorMessage()).toMatch(/^Error 404:/);
    expect(c.loading()).toBe(false);
  });

  it('should show string and generic errors', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(create(throwError(() => 'plain')).c.errorMessage()).toBe('plain');
    TestBed.resetTestingModule();
    expect(create(throwError(() => new Error('boom'))).c.errorMessage()).toBe('boom');
  });
});
