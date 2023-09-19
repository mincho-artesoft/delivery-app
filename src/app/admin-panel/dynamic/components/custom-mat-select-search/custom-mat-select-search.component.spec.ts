import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMatSelectSearchComponent } from './custom-mat-select-search.component';

describe('CustomMatSelectSearchComponent', () => {
  let component: CustomMatSelectSearchComponent;
  let fixture: ComponentFixture<CustomMatSelectSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomMatSelectSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomMatSelectSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
