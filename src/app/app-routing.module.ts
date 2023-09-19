import { NgModule } from '@angular/core';
import { RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { CustomReuseStrategy } from './custom-reuse-strategy';
import { UserProfileComponent } from './auth/components/user-profile/user-profile.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { LoginComponent } from './auth/components/login/login.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'user-profile',
    component: UserProfileComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./admin-panel/admin-panel-routing.module').then((m) => m.AdminPanelRoutingModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
  ],
  exports: [RouterModule],
})

export class AppRoutingModule { }
