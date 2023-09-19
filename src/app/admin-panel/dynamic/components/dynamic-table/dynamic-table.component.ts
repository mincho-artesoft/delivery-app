import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Observer, Operator, Subject, Subscription, map, takeUntil } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DynamicService } from '../../services/dynamic.service';
import { BaseExtendedFormArray } from '../../extends/base-extended-form-array';

interface TableData {
  displayedColumns: any[];
  dataHolder: any[];
}


@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent implements OnInit, OnDestroy {
  @Input('settings') settings: any;
  @Input('formGroup') formArray!: BaseExtendedFormArray;
  currentRoute: any;
  dataSource: any;
  displayedColumns: string[] = [];
  dataHolder: any = new BehaviorSubject([])
  private destroy$ = new Subject<void>();
  getCurrentUrl: any;
  modifiedCurrentRoute: any;
  count: any
  table!: Observable<TableData>;

  constructor(
    public router: Router,
    private http: HttpClient,
    public dynamicService: DynamicService
  ) {
  }


  ngOnInit(): void {
    this.settings = this.formArray.htmlSettings;
    if (this.settings) {
       const body = {
        "_id": "64d743027cee91fc292ba47d",
        "name": [
          {
            "key": "name_k1ey1",
            "value": "n3231121am1334234213123122424e_312v1al2u23133e1"
          },
          {
            "key": "name_key2",
            "value": "name_value2"
          }
        ],
        "brand_name": "brand_name_here",
        "description": [
          {
            "key": "description_key1",
            "value": "desc123ription_value1"
          },
          {
            "key": "description_key2",
            "value": "description_value2"
          }
        ],
        "organizationId": "64d4bd75227bd3a0fdcca700",
        "unit": "unit_value_here",
        "quantity": 0,
        "tags": null,
        "price": 499999999999.99,
        "currentProducts": [],
        "ingredients": null,
        "createdAt": "2023-08-12T08:29:54.822Z",
        "updatedAt": "2023-08-12T08:36:46.667Z"
      }

      this.table = this.http.request('Yget', this.settings.get.url).pipe(map((res: any) => {
        this.formArray.fillFormWithResponse(res)
        this.dataSource = new MatTableDataSource((this.formArray as FormArray).controls);
        this.dataSource.data.map((ctrl: any) => {
          ctrl.addControl('uid', new FormControl(this.generateRandomId(10)), { emitEvent: false });
        });
        this.dataHolder.next(this.dataSource.data);
        return {
          displayedColumns: this.settings.columns,
          dataHolder: this.dataSource.data
        }
      }))

      this.dataHolder = this.formArray.controls

     
      setTimeout(() =>{
      this.http.request('Ypost', this.settings.get.url, {body: body}).subscribe(res =>{
        // console.log(res)
      })
      }, 2000)

      setTimeout(() =>{
        this.http.request('Ydelete', this.settings.get.url, {body: body}).subscribe(res =>{
          // console.log(res)
        })
        }, 6000)
      // this.count.subscribe((res:any) => {
      //  console.log(res)
      // });
      // });

    };
  }
  generateRandomId(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  trackById(index: number, item: any): number {
    return item.controls.uid?.value || index;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.dataHolder, event.previousIndex, event.currentIndex);
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectRow(row: any) {
    this.dynamicService.lastSelectedRow = row?.getRawValue();
  }

}
