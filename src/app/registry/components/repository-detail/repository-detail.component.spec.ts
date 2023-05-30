import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoryDetailComponent } from './repository-detail.component';

describe('RepositoryComponent', () => {
  let component: RepositoryDetailComponent;
  let fixture: ComponentFixture<RepositoryDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositoryDetailComponent]
    });
    fixture = TestBed.createComponent(RepositoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
