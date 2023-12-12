import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsEditorComponent } from './teams-editor.component';

describe('TeamsComponentComponent', () => {
  let component: TeamsEditorComponent;
  let fixture: ComponentFixture<TeamsEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamsEditorComponent]
    });
    fixture = TestBed.createComponent(TeamsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
