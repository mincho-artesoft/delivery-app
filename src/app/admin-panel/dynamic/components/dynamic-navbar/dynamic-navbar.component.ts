import { Component, Input } from '@angular/core';
import { DynamicService } from '../../services/dynamic.service';
;

@Component({
  selector: 'app-dynamic-navbar',
  templateUrl: './dynamic-navbar.component.html',
  styleUrls: ['./dynamic-navbar.component.scss']
})
export class DynamicNavbarComponent {
  @Input('settings') settings: any;
  @Input('formGroup') formGroup: any;
  constructor(
    public dynamicService: DynamicService,
  ) {
  }

  ngOnInit(): void {
   
  }


  onClick(button: any) {
    this.dynamicService.handleButtonActions(button, this.formGroup);
  }
}
