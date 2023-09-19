import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { authRoutingModule } from './auth-routing.module';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { GuestComponent } from './components/guest/guest.component';
import { LoginOrGuestComponent } from './components/login-or-guest/login-or-guest.component';
import { MaterialModule } from '../material.module';
import { DynamicModule } from '../dynamic/dynamic.module';
import { DashbordComponent } from './components/dashbord/dashbord.component';
import { AdminPageModule } from '../admin-page/admin-page.module';

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
    SharedModule,
    FormsModule,
    MaterialModule,
    DynamicModule,
    AdminPageModule
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