import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagOverviewComponent } from './tag-overview.component';



describe('TagsComponent', () => {
  let component: TagOverviewComponent;
  let fixture: ComponentFixture<TagOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TagOverviewComponent]
    });
    fixture = TestBed.createComponent(TagOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
