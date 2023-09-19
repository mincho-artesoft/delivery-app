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
      this.table = this.http.request('Yget', this.settings.get.Yget).pipe(map((res: any) => {
        const data = JSON.parse(res);
        console.log(data);
        // this.formArray.fillFormWithResponse(data.structure)
        // this.dataSource = new MatTableDataSource((this.formArray as FormArray).controls);
        // this.dataSource.data.map((ctrl: any) => {
        //   ctrl.addControl('uid', new FormControl(this.generateRandomId(10)), { emitEvent: false });
        // });
        // this.dataHolder.next(this.dataSource.data);
        
        return {
          displayedColumns: this.settings.columns,
          dataHolder: [...this.dataSource.data]
        }
      }))

      this.dataHolder = this.formArray.controls;
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
