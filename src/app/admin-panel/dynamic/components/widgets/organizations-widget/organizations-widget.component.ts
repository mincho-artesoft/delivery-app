import { Component, OnInit } from '@angular/core';
import { DynamicService } from '../../../services/dynamic.service';
import { YjsService } from 'src/app/yjs.service';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-organizations-widget',
  templateUrl: './organizations-widget.component.html',
  styleUrls: ['./organizations-widget.component.scss']
})
export class OrganizationsWidgetComponent implements OnInit {
  constructor(private dynamicService: DynamicService, private http: HttpClient) {

  }

  hoverOrganizationsWidget = false;
  currentOrg: any = {};
  organizations: Observable<any>;
  language = 'US';
  hidePopupTimeout;




  ngOnInit(): void {
    this.organizations = this.http.request('Yget', '/organizations').pipe(map((res: any) => {
      const data = JSON.parse(res).structure || JSON.parse(res);
      return {
        organizations: data
      };
    }))
    this.organizations.subscribe({
      next: (organizations) => {
        organizations = organizations.organizations;
        if (!this.dynamicService.selectedOrganization.value._id) {
          const returnToOrgJSON = localStorage.getItem('selectedOrganization');
          if (returnToOrgJSON && returnToOrgJSON !== 'undefined') {
            try {
              const returnToOrg = JSON.parse(returnToOrgJSON);
              this.currentOrg = returnToOrg;
              this.dynamicService.selectedOrganization.setValue(returnToOrg, { emitEvent: false });
            } catch (e) {
              console.error("Error parsing organization from localStorage:", e);
              this.setFallbackOrganization(organizations);
            }
          } else {
            this.setFallbackOrganization(organizations);
          }
        } else {
          this.currentOrg = this.dynamicService.selectedOrganization.value;
        }
      },
      error: (err) => console.error('Failed to fetch organizations', err)
    });

  }

  setFallbackOrganization(organizations) {
    if (organizations && organizations.length > 0) {
      this.currentOrg = organizations[0];
      this.dynamicService.selectedOrganization.setValue(organizations[0], { emitEvent: false });
      localStorage.setItem('selectedOrganization', JSON.stringify(organizations[0]));
    }
  }
  showPopup() {
    this.hoverOrganizationsWidget = true;
    if (this.hidePopupTimeout) {
      clearTimeout(this.hidePopupTimeout);
    }
  }

  scheduleHidePopup() {
    this.hidePopupTimeout = setTimeout(() => {
      this.hoverOrganizationsWidget = false;
    }, 300);
  }

  cancelHidePopup() {
    if (this.hidePopupTimeout) {
      clearTimeout(this.hidePopupTimeout);
    }
  }

  selectOrganization(org: any) {
    this.currentOrg = org;
    this.dynamicService.selectedOrganization.setValue(org);
    localStorage.setItem('selectedOrganization', JSON.stringify(org));
  }

}
