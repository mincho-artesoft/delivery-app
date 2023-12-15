import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { DynamicService } from '../../../services/dynamic.service';

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
      Object.keys(res.services).map((key: any) => {
        services[res.services[key].settings.service.name] = res.services[key].settings.service.value;
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
