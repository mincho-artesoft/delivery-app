import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationsWidgetComponent } from './organizations-widget.component';

describe('OrganizationsWidgetComponent', () => {
  let component: OrganizationsWidgetComponent;
  let fixture: ComponentFixture<OrganizationsWidgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizationsWidgetComponent]
    });
    fixture = TestBed.createComponent(OrganizationsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
