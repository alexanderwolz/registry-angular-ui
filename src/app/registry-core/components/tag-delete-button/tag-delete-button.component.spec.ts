import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, throwError } from 'rxjs';
import { repository, tag } from 'src/testing/fixtures';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { ErrorEvent } from '../../../shared/models/error-event';
import { InfoEvent } from '../../../shared/models/info-event';
import { EventService } from '../../../shared/services/event.service';
import { Tag } from '../../models/tag';
import { RegistryService } from '../../services/registry.service';
import { TagDeleteButtonComponent } from './tag-delete-button.component';

describe('TagDeleteButtonComponent', () => {
  const repo = repository('app', 'team');
  let confirmed: boolean;
  let deleteTag: ReturnType<typeof vi.fn<(tag: Tag) => Observable<boolean>>>;
  let navigate: ReturnType<typeof vi.spyOn>;
  let emitted: unknown[];

  function create(tags: Tag[]) {
    deleteTag = vi.fn(() => of(true));
    TestBed.configureTestingModule({
      declarations: [TagDeleteButtonComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ...TEST_PROVIDERS,
        { provide: RegistryService, useValue: { deleteTag: (t: Tag) => deleteTag(t) } },
        { provide: NgbModal, useValue: { open: () => ({ result: Promise.resolve(confirmed) }) } },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    emitted = [];
    TestBed.inject(EventService).subject.subscribe((e) => emitted.push(e));
    const fixture = TestBed.createComponent(TagDeleteButtonComponent);
    fixture.componentInstance.tags = tags;
    fixture.detectChanges();
    return fixture;
  }

  const flush = () => new Promise((resolve) => setTimeout(resolve));

  beforeEach(() => (confirmed = true));

  it('should offer deletion only when tags are given', () => {
    const text = (create([]).nativeElement as HTMLElement).textContent!;
    expect(text).toContain('No tags provided');
    expect(text).not.toContain('Delete Tag');
  });

  it('should render a delete button for given tags', () => {
    const button = (create([tag('v1', repo)]).nativeElement as HTMLElement).querySelector('button');
    expect(button?.textContent).toContain('Delete Tag');
  });

  it('should delete every tag after confirmation, announce success and go back to the repository', async () => {
    const tags = [tag('v1', repo), tag('v2', repo)];
    const fixture = create(tags);
    fixture.componentInstance.delete(tags, {});
    await flush();
    expect(deleteTag.mock.calls.map(([t]) => t.name)).toEqual(['v1', 'v2']);
    expect(navigate).toHaveBeenCalledWith(['/repositories/team/app']);
    const infos = emitted.filter((e) => e instanceof InfoEvent) as InfoEvent[];
    expect(infos.map((e) => e.message)).toEqual([
      'Successfully deleted tag <strong>team/app:v1</strong>',
      'Successfully deleted tag <strong>team/app:v2</strong>',
    ]);
  });

  it('should delete nothing when the dialog is dismissed', async () => {
    confirmed = false;
    const tags = [tag('v1', repo)];
    create(tags).componentInstance.delete(tags, {});
    await flush();
    expect(deleteTag).not.toHaveBeenCalled();
    expect(emitted).toEqual([]);
  });

  it('should report a failed deletion without navigating', async () => {
    const tags = [tag('v1', repo)];
    const fixture = create(tags);
    deleteTag.mockReturnValue(of(false));
    fixture.componentInstance.delete(tags, {});
    await flush();
    expect(navigate).not.toHaveBeenCalled();
    expect(emitted.length).toBe(1);
    expect(emitted[0] instanceof ErrorEvent).toBe(true);
  });

  it('should report errors of the registry with their cause', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const tags = [tag('v1', repo)];
    const fixture = create(tags);
    const cause = new Error('405 Method Not Allowed');
    deleteTag.mockReturnValue(throwError(() => cause));
    fixture.componentInstance.delete(tags, {});
    await flush();
    const event = emitted[0] as ErrorEvent;
    expect(event.message).toBe('Error while deleting tag <strong>team/app:v1</strong>');
    expect(event.cause).toBe(cause);
  });
});
