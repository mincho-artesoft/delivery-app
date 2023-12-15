import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DynamicService } from '../../../services/dynamic.service';

@Component({
  selector: 'app-service-widget',
  templateUrl: './service-widget.component.html',
  styleUrls: ['./service-widget.component.scss']
})
export class ServiceWidgetComponent {

  constructor(
    private http: HttpClient,
    public dynamicService: DynamicService
  ) {
    this.dynamicService.selectedOrganization.valueChanges.subscribe(res => {
      this.http.request('Yget', `/services?path=${res._id}`).subscribe((res: any) => {
        res = JSON.parse(res);
        let services = {};
        Object.keys(res.services).map((key: any) => {
          services[res.services[key].settings.service.name] = res.services[key].settings.service.value;
        });
        console.log(services)
      });
    });
    
  }

}
