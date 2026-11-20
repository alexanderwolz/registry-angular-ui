import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';

describe('LogoComponent', () => {
  function create(dark?: boolean) {
    TestBed.configureTestingModule({ declarations: [LogoComponent], schemas: [NO_ERRORS_SCHEMA] });
    const fixture = TestBed.createComponent(LogoComponent);
    if (dark !== undefined) fixture.componentInstance.dark = dark;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show the product name', () => {
    const text = create().textContent;
    expect(text).toContain('Registry');
    expect(text).toContain('Frontend');
  });

  it('should be light by default and dark on request', () => {
    expect(create().querySelector('.logo')!.classList.contains('dark')).toBe(false);
    TestBed.resetTestingModule();
    expect(create(true).querySelector('.logo')!.classList.contains('dark')).toBe(true);
  });
});
