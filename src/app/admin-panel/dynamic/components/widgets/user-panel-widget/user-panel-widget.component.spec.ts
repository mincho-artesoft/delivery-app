import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPanelWidgetComponent } from './user-panel-widget.component';

describe('UserPanelWidgetComponent', () => {
  let component: UserPanelWidgetComponent;
  let fixture: ComponentFixture<UserPanelWidgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserPanelWidgetComponent]
    });
    fixture = TestBed.createComponent(UserPanelWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
