import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamWidgetComponent } from './team-widget.component';

describe('TeamWidgetComponent', () => {
  let component: TeamWidgetComponent;
  let fixture: ComponentFixture<TeamWidgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamWidgetComponent]
    });
    fixture = TestBed.createComponent(TeamWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
