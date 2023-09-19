import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginOrGuestComponent } from './login-or-guest.component';

describe('LoginOrGuestComponent', () => {
  let component: LoginOrGuestComponent;
  let fixture: ComponentFixture<LoginOrGuestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginOrGuestComponent]
    });
    fixture = TestBed.createComponent(LoginOrGuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
