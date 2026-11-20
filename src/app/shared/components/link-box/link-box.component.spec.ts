import { Component, NgModule } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

@Component({
  standalone: false,
  template: '<app-link-box routerLink="/repositories">Browse</app-link-box>',
})
class HostComponent {}

@NgModule({ declarations: [HostComponent], imports: [SharedModule] })
class TestModule {}

describe('LinkBoxComponent', () => {
  it('should link to the given route and project its content', () => {
    TestBed.configureTestingModule({ imports: [TestModule], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a')!;
    expect(link.getAttribute('href')).toBe('/repositories');
    expect(link.textContent).toContain('Browse');
  });
});
