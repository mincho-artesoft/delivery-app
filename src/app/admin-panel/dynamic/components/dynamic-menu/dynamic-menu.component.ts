import { Component, OnDestroy, OnInit } from '@angular/core';
import { ADMIN_PANEL_SETTINGS } from 'src/app/admin-panel/admin-panel-settings';
import { DynamicService } from '../../services/dynamic.service';
import { YjsService } from 'src/app/yjs.service';

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

  constructor(
    public dynamicService: DynamicService,
    private yjsService: YjsService
  ) {

  }
  ngOnInit(): void {

    ADMIN_PANEL_SETTINGS.pages.map((page: any) => {
      if (page.menuView) {
        if (page.menuView.group) {
          const prop = page.menuView.group.prop;
          if (prop) {
            const organization = this.yjsService.documentStructure.organizations[this.dynamicService.selectedOrganization?.value._id] || Object.values(this.yjsService.documentStructure.organizations)[0];
            if (organization[prop]) {
              const values = Object.values(organization[prop]).map((item: any, index: number) => {
                if (!item.name) {
                  item.name = `Team ${index}`,
                  item.label = item.name
                }
                return item
              })
              const object = {
                ...page.menuView,
                subMenus: values
              }
              this.menuItems.push(object)
            }
          } else {
            this.menuItems.map((item: any) => {
              if (item.path === page.menuView.group) {
                item.subMenus = item.subMenus || [];
                if (!item.subMenus.some((subItem: any) => subItem.path === page.menuView.path)) {
                  item.subMenus.push(page.menuView);
                }
              }
            });
          }
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
