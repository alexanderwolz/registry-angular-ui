import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagDeleteButtonComponent } from './tag-delete-button.component';

describe('TagDeleteButtonComponent', () => {
  let component: TagDeleteButtonComponent;
  let fixture: ComponentFixture<TagDeleteButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TagDeleteButtonComponent]
    });
    fixture = TestBed.createComponent(TagDeleteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
