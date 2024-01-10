import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DynamicService } from '../../../services/dynamic.service';

@Component({
  selector: 'app-service-widget',
  templateUrl: './service-widget.component.html',
  styleUrls: ['./service-widget.component.scss']
})
export class ServiceWidgetComponent {
  services = [];
  constructor(
    private http: HttpClient,
    public dynamicService: DynamicService
  ) {
    if (this.dynamicService.selectedOrganization.value._id) {
      this.http.request('Yget', `/services?path=${this.dynamicService.selectedOrganization.value._id}`).subscribe((res: any) => {
        this.services = JSON.parse(res).services;
        console.log('services', this.services)
      });
    }
  }

  getNavigationLink(service: any) {
    return `/${service.settings.data}`
  }
  onClick(service: any) {
    this.dynamicService.serviceGuid = service._id;
  }
}
