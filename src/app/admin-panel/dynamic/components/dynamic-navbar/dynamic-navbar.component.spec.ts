import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicNavbarComponent } from './dynamic-navbar.component';

describe('DynamicNavbarComponent', () => {
  let component: DynamicNavbarComponent;
  let fixture: ComponentFixture<DynamicNavbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicNavbarComponent]
    });
    fixture = TestBed.createComponent(DynamicNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
