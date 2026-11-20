import { TemplateRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, throwError } from 'rxjs';
import { repository, tag } from 'src/testing/fixtures';
import { TEST_PROVIDERS, routeParams } from 'src/testing/test-providers';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { Layer } from '../../../registry-core/models/layer';
import { Tag } from '../../../registry-core/models/tag';
import { RegistryService } from '../../../registry-core/services/registry.service';
import { ImageDetailComponent } from './image-detail.component';

describe('ImageDetailComponent', () => {
  const repo = repository('app', 'team');
  const open = vi.fn();

  function create(tag$: Observable<Tag>, params: Record<string, string>) {
    TestBed.configureTestingModule({
      imports: [ImageDetailComponent, TimeAgoPipe],
      providers: [
        ...TEST_PROVIDERS,
        routeParams(params),
        { provide: NgbModal, useValue: { open } },
        {
          provide: RegistryService,
          useValue: { createRepository: () => repo, getTag: () => tag$ },
        },
      ],
    });
    const fixture = TestBed.createComponent(ImageDetailComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  const full = { namespaces: 'team', name: 'app', tag: 'v1', image: '' };

  it('should select the image whose short digest is in the route', () => {
    const t = tag('v1', repo, ['amd64', 'arm64']);
    const c = create(of(t), { ...full, image: t.images[1].digestShort });
    expect(c.tag()).toBe(t);
    expect(c.image()).toBe(t.images[1]);
    expect(c.loading()).toBe(false);
  });

  it('should select no image for an unknown digest', () => {
    const c = create(of(tag('v1', repo)), { ...full, image: 'ffffffffffff' });
    expect(c.image()).toBeNull();
    expect(c.tag()).not.toBeNull();
  });

  it('should require name, tag and image', () => {
    expect(() => create(of(tag()), { tag: 'v1', image: 'a' })).toThrow(/'name'/);
    TestBed.resetTestingModule();
    expect(() => create(of(tag()), { name: 'app', image: 'a' })).toThrow(/'tag'/);
    TestBed.resetTestingModule();
    expect(() => create(of(tag()), { name: 'app', tag: 'v1' })).toThrow(/'image'/);
  });

  it('should show the http status of failures', () => {
    const c = create(
      throwError(() => new HttpErrorResponse({ status: 404 })),
      { ...full, image: 'a' },
    );
    expect(c.errorMessage()).toMatch(/^Error 404:/);
  });

  it('should open the layer dialog', () => {
    const c = create(of(tag('v1', repo)), { ...full, image: 'a' });
    const content = {} as TemplateRef<unknown>;
    c.showLayerDialog(new Layer('RUN a', 1), content);
    expect(open).toHaveBeenCalledWith(
      content,
      expect.objectContaining({ size: 'lg', centered: true }),
    );
  });
});
