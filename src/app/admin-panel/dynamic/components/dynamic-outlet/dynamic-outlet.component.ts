import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DynamicService } from '../../services/dynamic.service';
import { BaseExtendedFormGroup } from '../../extends/base-extended-form-group';

@Component({
  selector: 'app-dynamic-outlet',
  templateUrl: './dynamic-outlet.component.html',
  styleUrls: ['./dynamic-outlet.component.scss'],
})
export class DynamicOutletComponent{
  


  constructor( public dynamicService: DynamicService){
     
  }

}
