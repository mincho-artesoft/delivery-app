import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { OrganizationsWidgetComponent } from './components/widgets/organizations-widget/organizations-widget.component';
import { UserPanelWidgetComponent } from './components/widgets/user-panel-widget/user-panel-widget.component';
import { TeamWidgetComponent } from './components/widgets/team-widget/team-widget.component';
import { TeamsEditorComponent } from './components/custom-editors/teams-editor/teams-editor.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ServicesEditorComponent } from './components/custom-editors/services-editor/services-editor.component';
import { ServiceWidgetComponent } from './components/widgets/service-widget/service-widget.component';
import { InputEditorComponent } from './components/custom-editors/input-editor/input-editor.component';
import { FastEditorComponent } from './components/custom-editors/fast-editor/fast-editor.component';
import { DynamicWrapperComponent } from './components/dynamic-wrapper/dynamic-wrapper.component';
import { CustomSnackbarComponent } from './components/widgets/custom-snackbar/custom-snackbar.component';



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
    DynamicMenuComponent,
    OrganizationsWidgetComponent,
    UserPanelWidgetComponent,
    TeamWidgetComponent,
    TeamsEditorComponent,
    ServicesEditorComponent,
    ServiceWidgetComponent,
    InputEditorComponent,
    FastEditorComponent,
    DynamicWrapperComponent,
    CustomSnackbarComponent,
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
    HttpClientModule,
    NgxMatSelectSearchModule
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    AppRoutingModule,
    HttpClientModule,
    NgxMatSelectSearchModule
  ]
})
export class DynamicModule { }
