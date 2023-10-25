import { Component } from '@angular/core';
import { YjsService } from './yjs.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'delivery-project';

  constructor(public yjsService: YjsService) { }
}
