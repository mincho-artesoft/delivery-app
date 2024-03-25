import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { MaterialModule } from 'src/app/angular-material/material.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { HomeToolbarComponent } from './components/home-toolbar/home-toolbar.component';
import { LangContainerComponent } from './widgets/lang-container/lang-container.component';
import { MenuComponent } from './components/menu/menu.component';
import { MenuToolbarComponent } from './components/menu-toolbar/menu-toolbar.component';
import { MenuCardComponent } from './widgets/menu-card/menu-card.component';



@NgModule({
  declarations: [
    HomeComponent,
    HomeToolbarComponent,
    LangContainerComponent,
    MenuComponent,
    MenuToolbarComponent,
    MenuCardComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    NgxMatSelectSearchModule
  ],
  exports: [
    HomeComponent
  ]
})
export class BaseUiModule { }
