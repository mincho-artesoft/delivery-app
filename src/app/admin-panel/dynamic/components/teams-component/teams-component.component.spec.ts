import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsComponentComponent } from './teams-component.component';

describe('TeamsComponentComponent', () => {
  let component: TeamsComponentComponent;
  let fixture: ComponentFixture<TeamsComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamsComponentComponent]
    });
    fixture = TestBed.createComponent(TeamsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
