import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyTextComponent } from './copy-text.component';

describe('CopyTextComponent', () => {
  let component: CopyTextComponent;
  let fixture: ComponentFixture<CopyTextComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CopyTextComponent]
    });
    fixture = TestBed.createComponent(CopyTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
