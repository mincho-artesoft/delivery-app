import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { ADMIN_PANEL_SETTINGS } from 'src/app/admin-panel/admin-panel-settings';
import { DynamicService } from '../../services/dynamic.service';

@Component({
  selector: 'app-dynamic-menu',
  templateUrl: './dynamic-menu.component.html',
  styleUrls: ['./dynamic-menu.component.scss']
})
export class DynamicMenuComponent implements OnInit, OnDestroy {
  menuItems = <any>[];
  hoverMenu = false;
  panelOpenState = false;
  expandedMenus = {};
  
  constructor(private http: HttpClient,
    public dynamicService: DynamicService) {

  }
  ngOnInit(): void {
    
    ADMIN_PANEL_SETTINGS.pages.map((page: any) => {
      if (page.menuView) {
        if (page.menuView.group) {
          this.menuItems.map((item: any) => {
            if (item.path === page.menuView.group) {
              item.subMenus = item.subMenus || [];
              if (!item.subMenus.some((subItem: any) => subItem.path === page.menuView.path)) {
                item.subMenus.push(page.menuView);
              }
            }
          });
        } else {
          if (!this.menuItems.some((item: any) => item.path === page.menuView.path)) {
            this.menuItems.push(page.menuView);
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    console.log('destroyed')
  }

  toggleMenu(menu: string) {
    if (this.expandedMenus[menu]) {
      delete this.expandedMenus[menu]
    } else {
      this.expandedMenus[menu] = true;
    }
  }

  
}
