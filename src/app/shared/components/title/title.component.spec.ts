import { TestBed } from '@angular/core/testing';
import { TitleComponent } from './title.component';

describe('TitleComponent', () => {
  it('should show the segments in front of the title', () => {
    TestBed.configureTestingModule({ imports: [TitleComponent] });
    const fixture = TestBed.createComponent(TitleComponent);
    fixture.componentInstance.segments = ['team', 'app'];
    fixture.componentInstance.title = 'Tags';
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent!.replace(/\s+/g, ' ').trim()).toBe('team / app / Tags');
    expect(element.querySelector('.title')!.textContent).toBe('Tags');
  });
});
