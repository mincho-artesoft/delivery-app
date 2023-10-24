import { NgModule } from '@angular/core';
import { Routes, RouterModule, RouteReuseStrategy } from '@angular/router';
import { DynamicOutletComponent } from './dynamic/components/dynamic-outlet/dynamic-outlet.component';
import { DynamicRouteGuard } from './guards/dynamic-route.guard';
import { CustomReuseStrategy } from '../custom-reuse-strategy';


const routes: Routes = [
  {
    path: ':primary',
    component: DynamicOutletComponent,
    canActivate: [DynamicRouteGuard],
    children: [
      {
        path: ':secondary/:id',
        component: DynamicOutletComponent,
        canActivate: [DynamicRouteGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: ':secondary',
        component: DynamicOutletComponent,
        canActivate: [DynamicRouteGuard],
        runGuardsAndResolvers: 'always',
      },
      
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
  ],
  exports: [RouterModule]
})
export class AdminPanelRoutingModule { }
