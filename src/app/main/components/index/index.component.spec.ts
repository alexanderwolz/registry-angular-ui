import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from 'src/testing/test-providers';
import { IndexComponent } from './index.component';

describe('IndexComponent', () => {
  it('should frame the routed page with navbar and footer', () => {
    TestBed.configureTestingModule({
      declarations: [IndexComponent],
      providers: [...TEST_PROVIDERS],
      schemas: [NO_ERRORS_SCHEMA],
    });
    const fixture = TestBed.createComponent(IndexComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    for (const selector of ['app-navbar', '#content router-outlet', 'app-footer']) {
      expect(element.querySelector(selector), selector).toBeTruthy();
    }
  });
});
