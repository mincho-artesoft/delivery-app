import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { DynamicService } from '../../../services/dynamic.service';

interface IService {
  settings: {
    settings: {
      data: string,
      default: string,
      options: any[],
      title: string,
      validators: any[]
    },
    value: string,
    _id: string
  }
}

@Component({
  selector: 'app-services-editor',
  templateUrl: './services-editor.component.html',
  styleUrls: ['./services-editor.component.scss']
})
export class ServicesEditorComponent implements OnInit {
  @Input('column') column: any;
  constructor(private http: HttpClient, public dynamicService: DynamicService) {

  }

  ngOnInit(): void {
    this.http.request('Yget', `/services?path=${this.dynamicService.lastSelectedRow._id}`).subscribe((res: any) => {
      res = JSON.parse(res);
      let services = {};
      res.services.map((service: IService) => {
        services[service.settings.settings.title] = service.settings.value;
      });
      this.column.columns[0].control.root.get('services').patchValue(services)
    });
  }

  toggleExpand(event: Event, option: any): void {
    event.stopPropagation();
    option.isExpanded = !option.isExpanded;
  }

  deselectService(column: any) {
    console.log(column.control)
    // this.http.request('Ydelete', `/services?path=6581b68a-8618-4181-ad66-25a22e90dcd3.ZtlYsEYasf.service`).subscribe((res: string) => {
    //   console.log(JSON.parse(res));
    // column.control.setValue('');

    // });
  }
}
