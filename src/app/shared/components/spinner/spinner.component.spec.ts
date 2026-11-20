import { TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  it('should announce loading to assistive technology', () => {
    TestBed.configureTestingModule({ imports: [SpinnerComponent] });
    const fixture = TestBed.createComponent(SpinnerComponent);
    fixture.detectChanges();
    const spinner = (fixture.nativeElement as HTMLElement).querySelector('[role="status"]');
    expect(spinner?.textContent).toContain('Loading');
  });
});
