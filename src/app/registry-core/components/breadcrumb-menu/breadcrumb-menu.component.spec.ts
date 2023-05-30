import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbMenuComponent } from './breadcrumb-menu.component';

describe('BreadcrumbMenuComponent', () => {
  let component: BreadcrumbMenuComponent;
  let fixture: ComponentFixture<BreadcrumbMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BreadcrumbMenuComponent]
    });
    fixture = TestBed.createComponent(BreadcrumbMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
