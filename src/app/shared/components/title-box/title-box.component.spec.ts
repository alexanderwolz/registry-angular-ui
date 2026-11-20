import { Component, NgModule } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { TestBed } from '@angular/core/testing';

@Component({
  standalone: false,
  template:
    '<app-title-box [segments]="[\'a\']" title="T"><button id="projected">x</button></app-title-box>',
})
class HostComponent {}

@NgModule({ declarations: [HostComponent], imports: [SharedModule] })
class TestModule {}

describe('TitleBoxComponent', () => {
  it('should pass segments and title on and project its content', () => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('app-title')!.textContent!.replace(/\s+/g, ' ')).toContain(
      'a / T',
    );
    expect(element.querySelector('#projected')).toBeTruthy();
  });
});
