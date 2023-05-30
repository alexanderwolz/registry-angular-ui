import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleBoxComponent } from './title-box.component';

describe('TitleBoxComponent', () => {
  let component: TitleBoxComponent;
  let fixture: ComponentFixture<TitleBoxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TitleBoxComponent]
    });
    fixture = TestBed.createComponent(TitleBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
