import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DynamicService } from '../../../services/dynamic.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-service-widget',
  templateUrl: './service-widget.component.html',
  styleUrls: ['./service-widget.component.scss']
})
export class ServiceWidgetComponent {
  services: Observable<any>;
  constructor(
    private http: HttpClient,
    public dynamicService: DynamicService
  ) {
    if (this.dynamicService.selectedOrganization.value._id) {
      this.services = this.http.request('Yget', `/services?path=${this.dynamicService.selectedOrganization.value._id}`).pipe(map((res: any) => {
        const data = JSON.parse(res).structure || JSON.parse(res);
        data.services.map((service: any, index: number) => {
          service.settings.settings.img = `assets/images/${service.settings.settings.data}.png`
          this.dynamicService.interpolateData[service.settings.settings.data] = service._id
        })
        return {
          services: data.services
        };
      }))
    }
  }

  getNavigationLink(service: any) {
    return `/${service.settings.settings.data}`
  }
  onClick(service: any) {
    this.dynamicService.serviceGuid = service._id;
    localStorage.setItem('selectedService', JSON.stringify(service._id))
  }
}
