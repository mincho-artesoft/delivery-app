import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ADMIN_PANEL_SETTINGS } from 'src/app/admin-panel/admin-panel-settings';

@Component({
  selector: 'app-dynamic-menu',
  templateUrl: './dynamic-menu.component.html',
  styleUrls: ['./dynamic-menu.component.scss']
})
export class DynamicMenuComponent implements OnInit {
  menuItems = <any>[];
  hoverMenu = false;
  constructor(private http: HttpClient) {

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
        } else if (page.menuView.groupItems) {
          this.http.request('Yget', page.menuView.groupItems.yGet).subscribe((res: any) => {
            let itemToAdd = JSON.parse(JSON.stringify(page.menuView));
            itemToAdd.subMenus = JSON.parse(res).structure.map((sub: any) => {
              return {
                name: sub._id,
                label: sub._id,
                path: '/warehouses',
              }
            });
            if (!this.menuItems.some((item: any) => item.path === page.menuView.path)) {
              this.menuItems.push(itemToAdd);
            } else {
              this.menuItems.map((item: any) => {
                if (item.path === itemToAdd.path) {
                  item.subMenus = itemToAdd.subMenus;
                }
              })
            }
          })
        } else {
          if (!this.menuItems.some((item: any) => item.path === page.menuView.path)) {
            this.menuItems.push(page.menuView);
          }
        }
      }
    });

  }
}
