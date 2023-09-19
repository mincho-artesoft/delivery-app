import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { GuestComponent } from './components/guest/guest.component';
import { LoginOrGuestComponent } from './components/login-or-guest/login-or-guest.component';
import { DashbordComponent } from './components/dashbord/dashbord.component';
import { MaterialModule } from '../admin-panel/dynamic/angular-material/material.module';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    UserProfileComponent,
    GuestComponent,
    LoginOrGuestComponent,
    DashbordComponent
  ],
  imports: [
    CommonModule,
    // authRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule
  ],
  exports:[
    LoginComponent,
    RegisterComponent,
    UserProfileComponent,
    GuestComponent,
    LoginOrGuestComponent,
    DashbordComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AuthModule { }