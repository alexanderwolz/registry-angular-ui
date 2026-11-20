import { TestBed } from '@angular/core/testing';
import { RouterLink } from '@angular/router';
import { repository, tag } from 'src/testing/fixtures';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { ImageListComponent } from './image-list.component';

describe('ImageListComponent', () => {
  function create(withTag: boolean) {
    TestBed.configureTestingModule({
      imports: [RouterLink, ImageListComponent, TimeAgoPipe],
      providers: [...TEST_PROVIDERS],
    });
    const fixture = TestBed.createComponent(ImageListComponent);
    if (withTag)
      fixture.componentInstance.tag = tag('v1', repository('app', 'team'), ['amd64', 'arm64']);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should render nothing without a tag', () => {
    expect(create(false).querySelector('table')).toBeNull();
  });

  it('should list every image with link, platform and size', () => {
    const rows = Array.from(create(true).querySelectorAll('tbody tr'));
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('linux/amd64');
    expect(rows[1].textContent).toContain('linux/arm64');
    expect(rows[0].querySelector('a')!.getAttribute('href')!).toMatch(
      /^\/repositories\/team\/app\/tags\/v1\/images\/[0-9a-f]{12}$/,
    );
  });
});
