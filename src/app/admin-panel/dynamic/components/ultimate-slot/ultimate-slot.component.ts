import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CdkDragStart, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { DynamicService } from '../../services/dynamic.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InterpolateService } from '../../services/interpolate.service';
import { AbstractControl } from '@angular/forms';
import { Observable, combineLatest, debounceTime, distinctUntilChanged, map, of, startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-ultimate-slot',
  templateUrl: './ultimate-slot.component.html',
  styleUrls: ['./ultimate-slot.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
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
    const rowCells = this.elementRef.nativeElement.querySelectorAll('.cell-row');
      rowCells.forEach((cell, index) => {
        cell.style.width = `${this.dynamicService.cellWidths[index]}px`;
      });
    this.dynamicService.cellWidthsChanged.subscribe((newWidths) => {
      console.log(newWidths)
      const rowCells = this.elementRef.nativeElement.querySelectorAll('.cell-row');
      rowCells.forEach((cell, index) => {
        cell.style.width = `${newWidths[index]}px`;
      });
    });
  }


  processObjectRenderer(column: any, value: any) {
    return InterpolateService.suplant(column.label, this.rowControl);

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