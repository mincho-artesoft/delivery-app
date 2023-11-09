import { Component } from '@angular/core';

@Component({
  selector: 'app-user-panel-widget',
  templateUrl: './user-panel-widget.component.html',
  styleUrls: ['./user-panel-widget.component.scss']
})
export class UserPanelWidgetComponent {
  userPanelOpened = false;


  openUserPanel() {
    this.userPanelOpened = !this.userPanelOpened;
  }

}
