import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesEditorComponent } from './services-editor.component';

describe('ServicesEditorComponent', () => {
  let component: ServicesEditorComponent;
  let fixture: ComponentFixture<ServicesEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ServicesEditorComponent]
    });
    fixture = TestBed.createComponent(ServicesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
