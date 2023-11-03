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
  hoverLeftMenu = false;
  panelOpenState = false;
  expandedMenus = {};
  currentOrg: string;
  organizations;
  language = 'US';



  fakeItems = ['Menu', 'Employees', 'Recipes'];
  fakeOrg = [
    { img: 'https://marketplace.canva.com/EAFpeiTrl4c/1/0/1600w/canva-abstract-chef-cooking-restaurant-free-logo-9Gfim1S8fHg.jpg', name: 'Master Chef', email: 'master-chef@mail.com' },
    { img: 'https://static.vecteezy.com/system/resources/previews/009/361/083/original/restaurant-logo-design-free-file-free-vector.jpg', name: 'Healthy food', email: 'healthyanddelicious@mail.com' },
    { img: 'https://img.freepik.com/premium-vector/catering-quality-food-design-logo_187482-593.jpg', name: 'Cathering', email: 'catheringforyou@mail.com' },
    { img: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/restaurant-logo%2Ccatering-logo%2Cspoon-logo-icon-design-template-2ce0a2137f418d6b4083ed268b3e2834_screen.jpg?ts=1663417865', name: 'Your place', email: 'itsyourplace@mail.com' }

  ]
  constructor(private http: HttpClient,
    public dynamicService: DynamicService) {

  }
  ngOnInit(): void {
    let orgJSON = JSON.parse(localStorage.getItem('organizations'));
    this.organizations = Object.keys(orgJSON).map((key: string, index: number )=> {
      orgJSON[key].data.organizationData.img = this.fakeOrg[index].img;
      return orgJSON[key].data.organizationData
    })
    
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
