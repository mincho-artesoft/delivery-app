import { Component, OnInit } from '@angular/core';
import { DynamicService } from '../../../services/dynamic.service';
import { YjsService } from 'src/app/yjs.service';

@Component({
  selector: 'app-organizations-widget',
  templateUrl: './organizations-widget.component.html',
  styleUrls: ['./organizations-widget.component.scss']
})
export class OrganizationsWidgetComponent implements OnInit {
  constructor(private dynamicService: DynamicService, private yjsService: YjsService) {

  }

  hoverOrganizationsWidget = false;
  currentOrg: any = {};
  organizations;
  language = 'US';
  hidePopupTimeout;


  fakeOrg = [
    { img: 'https://marketplace.canva.com/EAFpeiTrl4c/1/0/1600w/canva-abstract-chef-cooking-restaurant-free-logo-9Gfim1S8fHg.jpg', name: 'Master Chef', email: 'master-chef@mail.com' },
    { img: 'https://static.vecteezy.com/system/resources/previews/009/361/083/original/restaurant-logo-design-free-file-free-vector.jpg', name: 'Healthy food', email: 'healthyanddelicious@mail.com' },
    { img: 'https://img.freepik.com/premium-vector/catering-quality-food-design-logo_187482-593.jpg', name: 'Cathering', email: 'catheringforyou@mail.com' },
    { img: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/restaurant-logo%2Ccatering-logo%2Cspoon-logo-icon-design-template-2ce0a2137f418d6b4083ed268b3e2834_screen.jpg?ts=1663417865', name: 'Your place', email: 'itsyourplace@mail.com' }

  ]

  ngOnInit(): void {
    // TODO When we have ids from the backend this logic must be removed. It's only for testing;
    Object.keys(this.yjsService.documentStructure.organizations).map((key: any, index: any) => {
      if (!this.yjsService.documentStructure.organizations[key].organizationData._id) {
        this.yjsService.documentStructure.organizations[key].organizationData._id = key;
      }
      if (!this.yjsService.documentStructure.organizations[key].organizationData.img) {
        this.yjsService.documentStructure.organizations[key].organizationData.img = this.fakeOrg[index].img;
      }
    });
    //

    this.organizations = Object.values(this.yjsService.documentStructure.organizations).map(item => {
      return item.organizationData;
    });
    if (!this.dynamicService.selectedOrganization.value._id) {
      this.currentOrg = this.organizations[0];
      this.dynamicService.selectedOrganization.setValue(this.organizations[0], { emitEvent: false });
    } else {
      this.currentOrg = this.dynamicService.selectedOrganization.value;
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
  }

}
