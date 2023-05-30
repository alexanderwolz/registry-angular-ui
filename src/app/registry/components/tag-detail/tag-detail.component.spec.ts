import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagDetailComponent } from './tag-detail.component';

describe('TagComponent', () => {
  let component: TagDetailComponent;
  let fixture: ComponentFixture<TagDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TagDetailComponent]
    });
    fixture = TestBed.createComponent(TagDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
