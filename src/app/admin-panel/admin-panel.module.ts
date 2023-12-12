import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPanelRoutingModule} from './admin-panel-routing.module';
import { AppRoutingModule } from '../app-routing.module';
import { DynamicModule } from './dynamic/dynamic.module';



@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    AdminPanelRoutingModule,
    AppRoutingModule,
    DynamicModule
  ],
  exports: [
    DynamicModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminPanelModule { }
