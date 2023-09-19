import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicMenuComponent } from './dynamic-menu.component';

describe('DynamicMenuComponent', () => {
  let component: DynamicMenuComponent;
  let fixture: ComponentFixture<DynamicMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicMenuComponent]
    });
    fixture = TestBed.createComponent(DynamicMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
