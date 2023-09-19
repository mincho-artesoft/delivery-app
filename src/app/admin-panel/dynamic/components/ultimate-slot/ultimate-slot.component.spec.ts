import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UltimateSlotComponent } from './ultimate-slot.component';

describe('UltimateSlotComponent', () => {
  let component: UltimateSlotComponent;
  let fixture: ComponentFixture<UltimateSlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UltimateSlotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UltimateSlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
