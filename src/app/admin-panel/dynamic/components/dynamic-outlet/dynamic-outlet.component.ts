import { Component, OnDestroy } from '@angular/core';
import { DynamicService } from '../../services/dynamic.service';

@Component({
  selector: 'app-dynamic-outlet',
  templateUrl: './dynamic-outlet.component.html',
  styleUrls: ['./dynamic-outlet.component.scss'],
})
export class DynamicOutletComponent implements OnDestroy{
  

  constructor( public dynamicService: DynamicService){
     
  }

  ngOnDestroy(): void {
    console.log('Outlet is destroyed')
  }
}
