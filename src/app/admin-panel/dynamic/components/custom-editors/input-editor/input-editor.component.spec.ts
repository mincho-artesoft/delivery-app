import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputEditorComponent } from './input-editor.component';

describe('ProductEditorComponent', () => {
  let component: InputEditorComponent;
  let fixture: ComponentFixture<InputEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InputEditorComponent]
    });
    fixture = TestBed.createComponent(InputEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
