import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import { MaterialModule } from './angular-material/material.module';
import { CustomMatSelectSearchComponent } from './components/custom-mat-select-search/custom-mat-select-search.component';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table.component';
import { UltimateSlotComponent } from './components/ultimate-slot/ultimate-slot.component';
import { DynamicDialogComponent } from './components/dynamic-dialog/dynamic-dialog.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { DynamicNavbarComponent } from './components/dynamic-navbar/dynamic-navbar.component';
import { DynamicOutletComponent } from './components/dynamic-outlet/dynamic-outlet.component';
import { DynamicMenuComponent } from './components/dynamic-menu/dynamic-menu.component';
import { HttpClientModule } from '@angular/common/http';
import { DynamicComponent } from './components/dynamic/dynamic.component';



@NgModule({
  declarations: [
    DynamicComponent,
    CustomMatSelectSearchComponent,
    DynamicTableComponent,
    UltimateSlotComponent,
    DynamicDialogComponent,
    ConfirmDialogComponent,
    DynamicNavbarComponent,
    DynamicOutletComponent,
    DynamicMenuComponent
  ],
  exports: [
    DynamicComponent,
    MaterialModule,
    DynamicTableComponent,
    UltimateSlotComponent,
    DynamicNavbarComponent,
    DynamicOutletComponent,
    DynamicDialogComponent,
    DynamicMenuComponent,
    HttpClientModule
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    AppRoutingModule,
    HttpClientModule
  ]
})
export class DynamicModule { }
