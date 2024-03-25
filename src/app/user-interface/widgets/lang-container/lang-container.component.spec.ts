import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangContainerComponent } from './lang-container.component';

describe('LangContainerComponent', () => {
  let component: LangContainerComponent;
  let fixture: ComponentFixture<LangContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LangContainerComponent]
    });
    fixture = TestBed.createComponent(LangContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
