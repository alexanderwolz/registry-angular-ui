import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LinkBoxComponent } from './link-box.component';

@Component({
  template: '<app-link-box routerLink="/repositories">Browse</app-link-box>',
  imports: [LinkBoxComponent],
})
class HostComponent {}

describe('LinkBoxComponent', () => {
  it('should link to the given route and project its content', () => {
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a')!;
    expect(link.getAttribute('href')).toBe('/repositories');
    expect(link.textContent).toContain('Browse');
  });
});
