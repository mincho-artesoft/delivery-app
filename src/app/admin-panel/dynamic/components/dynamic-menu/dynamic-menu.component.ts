import { Component, OnDestroy, OnInit } from '@angular/core';
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

  constructor(
    public dynamicService: DynamicService,
  ) {
    
  }

  ngOnInit(): void {
   
  }

  ngOnDestroy(): void {
  }

  toggleMenu(menu: string) {
    if (this.expandedMenus[menu]) {
      delete this.expandedMenus[menu]
    } else {
      this.expandedMenus[menu] = true;
    }
  }


}
