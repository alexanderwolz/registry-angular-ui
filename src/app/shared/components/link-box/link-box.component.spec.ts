import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkBoxComponent } from './link-box.component';

describe('LinkBoxComponent', () => {
  let component: LinkBoxComponent;
  let fixture: ComponentFixture<LinkBoxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinkBoxComponent]
    });
    fixture = TestBed.createComponent(LinkBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
