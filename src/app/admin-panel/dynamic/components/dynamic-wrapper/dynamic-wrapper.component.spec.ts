import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicWrapperComponent } from './dynamic-wrapper.component';

describe('DynamicWrapperComponent', () => {
  let component: DynamicWrapperComponent;
  let fixture: ComponentFixture<DynamicWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicWrapperComponent]
    });
    fixture = TestBed.createComponent(DynamicWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
