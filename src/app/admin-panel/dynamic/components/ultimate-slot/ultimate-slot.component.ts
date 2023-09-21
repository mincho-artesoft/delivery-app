import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CdkDragStart, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { DynamicService } from '../../services/dynamic.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ultimate-slot',
  templateUrl: './ultimate-slot.component.html',
  styleUrls: ['./ultimate-slot.component.scss'],
})
export class UltimateSlotComponent implements AfterViewInit, OnInit {
  @Input('settings') settings: any;
  @Input('dataHolder') dataHolder: any;
  @Input('control') rowControl: any;
  @Input('dataSource') dataSource: any;

  editorVisible = false;
  id: any

  isDialog!: boolean;
  @ViewChild(CdkDropList, { static: false }) dropList?: CdkDropList;


  constructor(
    public cdr: ChangeDetectorRef,
    public dynamicService: DynamicService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private elementRef: ElementRef) {
      this.dynamicService.cellWidthsChanged.subscribe((newWidths) => {
        const rowCells = this.elementRef.nativeElement.querySelectorAll('.cell-row');
        rowCells.forEach((cell, index) => {
          cell.style.width = `${newWidths[index]}px`;
        });
      });
  }

  ngOnInit(): void {
  }

  dropped(event: any) {
    const swapItem = event.container.data[0];
    const targetId = this.dynamicService.itemToDrop;
    let indexToRemove = this.dataSource.data.findIndex(
      (control: any) => {
        return control.controls['id'].value === targetId;
      }
    );
    let indexToAdd = this.dataSource.data.findIndex(
      (control: any) => {
        return control.controls['id'].value === swapItem.controls['id'].value
      }
    );
    if (event.currentIndex === 0 && indexToRemove < indexToAdd) {
      indexToAdd--;
    } else if (event.currentIndex === 1 && indexToRemove > indexToAdd) {
      indexToAdd++;
    }
    moveItemInArray(this.dataSource.data, indexToRemove, indexToAdd);
    this.dataHolder.next([...this.dataSource.data]);
    this.cdr.detectChanges();
    this.dynamicService.itemToDrop = '';
  }



  start(event: CdkDragStart) {
    this.dynamicService.itemToDrop = event.source.dropContainer.data[0].controls['id'].value;
  }

  ngAfterViewInit(): void {
    if (this.dropList) {
      this.dynamicService.register(this.dropList);
    }
  }

  processObjectRenderer(column: any, value: any): string {
    let separator = column.separator || ', ';
    let label = column.label || '';
    const replacePlaceholder = (str: any, data: any) => {
      const placeholders = str.match(/\${.*?}/g) || [];
      let resultArr = [];

      for (const placeholder of placeholders) {
        const prop = placeholder.slice(2, -1);
        if (data?.hasOwnProperty(prop) && data[prop]) {
          resultArr.push(data[prop]);
        }
      }

      return resultArr.join(separator);
    };

    if (Array.isArray(value)) {
      return value.map(item => replacePlaceholder(label, item)).join(separator);
    } else if (typeof value === 'object') {
      if (value?.value instanceof Date && value.settings && value.settings?.storage === 'iso') {
        return value?.value.toISOString();
      } else {
        return replacePlaceholder(label, value);
      }
    }

    return '';
  }


  submitValue(cell: any, control: any) {
    this.editorVisible = false;
    let message = this.dynamicService.interpolate(cell.editor.message, control.getRawValue());
    this.snackbar.open(message, 'Close', {
      duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
    })
  }

  open(button: any, control: any) {
    this.dynamicService.handleButtonActions(button, control)
  }
  
  
}