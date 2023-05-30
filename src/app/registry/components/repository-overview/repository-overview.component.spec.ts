import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoryOverviewComponent } from './repository-overview.component';

describe('RepositoriesComponent', () => {
  let component: RepositoryOverviewComponent;
  let fixture: ComponentFixture<RepositoryOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositoryOverviewComponent]
    });
    fixture = TestBed.createComponent(RepositoryOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
