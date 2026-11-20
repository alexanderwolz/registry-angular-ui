import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterLink } from '@angular/router';
import { repository, tag } from 'src/testing/fixtures';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { TagListComponent } from './tag-list.component';

describe('TagListComponent', () => {
  const repo = repository('app', 'team');

  function create(showMoreLine?: boolean) {
    TestBed.configureTestingModule({
      imports: [RouterLink],
      declarations: [TagListComponent],
      providers: [...TEST_PROVIDERS],
      schemas: [NO_ERRORS_SCHEMA],
    });
    const fixture = TestBed.createComponent(TagListComponent);
    fixture.componentInstance.tags = [tag('v1', repo, ['amd64', 'arm64']), tag('v2', repo)];
    if (showMoreLine !== undefined) fixture.componentInstance.showMoreLine = showMoreLine;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should list a row with a link per tag', () => {
    const element = create();
    const links = Array.from(element.querySelectorAll('tbody a'));
    expect(links.map((a) => a.textContent!.trim())).toEqual(['v1', 'v2']);
    expect(links[0].getAttribute('href')).toBe('/repositories/team/app/tags/v1');
  });

  it('should show the operating systems and type of a tag', () => {
    const row = create().querySelector('tbody tr')!;
    expect(row.textContent).toContain('linux');
    expect(row.textContent).toContain('Image');
  });

  it('should only add the placeholder row on request', () => {
    expect(create().querySelectorAll('tbody tr').length).toBe(2);
    TestBed.resetTestingModule();
    expect(create(true).querySelectorAll('tbody tr').length).toBe(3);
  });
});
