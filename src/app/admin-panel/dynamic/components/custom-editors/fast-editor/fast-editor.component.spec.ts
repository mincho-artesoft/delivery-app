import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FastEditorComponent } from './fast-editor.component';

describe('FastEditorComponent', () => {
  let component: FastEditorComponent;
  let fixture: ComponentFixture<FastEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FastEditorComponent]
    });
    fixture = TestBed.createComponent(FastEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
