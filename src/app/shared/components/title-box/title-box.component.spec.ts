import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TitleBoxComponent } from './title-box.component';

@Component({
  template:
    '<app-title-box [segments]="[\'a\']" title="T"><button id="projected">x</button></app-title-box>',
  imports: [TitleBoxComponent],
})
class HostComponent {}

describe('TitleBoxComponent', () => {
  it('should pass segments and title on and project its content', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('app-title')!.textContent!.replace(/\s+/g, ' ')).toContain(
      'a / T',
    );
    expect(element.querySelector('#projected')).toBeTruthy();
  });
});
