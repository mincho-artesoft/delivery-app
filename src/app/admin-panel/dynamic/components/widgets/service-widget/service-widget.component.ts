import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DynamicService } from '../../../services/dynamic.service';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';

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
    this.services = this.dynamicService.selectedOrganization.valueChanges.pipe(
      startWith(this.dynamicService.selectedOrganization.value),
      switchMap(organization =>
        organization && organization._id ? this.fetchServices(organization._id) : of({ services: [] })
      ),
      catchError(error => {
        console.error('Error fetching services', error);
        return of({ services: [] });
      })
    );
  }

  private fetchServices(orgId: string): Observable<any> {
    return this.http.request('yGet', `/services?path=${orgId}`).pipe(
      map((res: any) => {
        const data = JSON.parse(res).structure || JSON.parse(res);
        data.services.forEach((service: any) => {
          service.settings.settings.img = `assets/images/${service.settings.settings.data}.png`;
          this.dynamicService.interpolateData[service.settings.settings.data] = service._id;
        });
        return { services: data.services };
      }),
      catchError(error => {
        console.error('Error processing services', error);
        return of({ services: [] });
      })
    );
  }

  getNavigationLink(service: any) {
    return `/${service.settings.settings.data}`
  }
  onClick(service: any) {
    this.dynamicService.serviceGuid = service._id;
    localStorage.setItem('selectedService', JSON.stringify(service._id))
  }
}
