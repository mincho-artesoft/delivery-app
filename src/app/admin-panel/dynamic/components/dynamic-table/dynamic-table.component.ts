import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Observer, Operator, Subject, Subscription, map, startWith, switchMap, takeUntil } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DynamicService } from '../../services/dynamic.service';
import { BaseExtendedFormArray } from '../../extends/base-extended-form-array';
import { MatSort } from '@angular/material/sort';
import { InterpolateService } from '../../services/interpolate.service';

interface TableData {
  displayedColumns: any[];
  dataHolder: any[];
}


@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input('settings') settings: any;
  @Input('formGroup') formArray!: BaseExtendedFormArray;
  dataSource: any;
  dataHolder: any = new BehaviorSubject([])
  private destroy$ = new Subject<void>();
  table!: Observable<TableData>;

  public totalOverlayWidth = 0;
  public isResizing = false;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public router: Router,
    private http: HttpClient,
    public dynamicService: DynamicService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
  ) {
  }


  ngOnInit(): void {
    this.settings = this.formArray.htmlSettings;
    if (this.settings) {
      this.table = this.dynamicService.selectedOrganization.valueChanges.pipe(
        startWith(this.dynamicService.selectedOrganization.value),
        switchMap(selectedOrganization => {
          this.dynamicService.interpolateData.selectedOrganization = selectedOrganization;
          const path = this.settings.yGet.interpolate ?
            InterpolateService.suplant(this.settings.yGet.interpolate, this.dynamicService.interpolateData) :
            this.settings.yGet.path;
            console.log(path)
          return this.http.request('Yget', path).pipe(
            map((res: any) => {
              const data = JSON.parse(res).structure || JSON.parse(res);
              console.log(data)
              this.formArray.fillFormWithResponse(data);
              this.dataSource = new MatTableDataSource((this.formArray as FormArray).controls);

              this.dataSource.data.forEach((ctrl: any) => {
                ctrl.addControl('uid', new FormControl(this.generateRandomId(10)), { emitEvent: false });
              });

              this.syncContainerWidths();
              this.syncCellWidths();

              return {
                displayedColumns: this.settings.columns,
                dataHolder: [...this.dataSource.data]
              };
            })
          );
        })
      );
    }
  }

  sortData(event: any) {
    const sortField = event.active;
    const sortDirection = event.direction;

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.syncContainerWidths();
      this.selectRow(this.dataSource.data[0]);
    }, 50)
  }
  stretchLastColumnIfNeeded() {
    let totalWidth = 0;
    this.settings.columns.forEach(col => {
      totalWidth += col.width || 250;
    });
    const viewportWidth = window.innerWidth;
    if (totalWidth < viewportWidth) {
      const lastColumn = this.settings.columns[this.settings.columns.length - 1];
      lastColumn.width = (lastColumn.width || 250) + (viewportWidth - totalWidth - 90);
    }
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
    this.dynamicService.lastSelectedFormGroup = row;
    localStorage.setItem('lastSelectedRow', JSON.stringify(row?.getRawValue()));
  }

  public startResizing(event: MouseEvent, index: number, cell: any) {
    this.isResizing = true;
    let start = event.clientX;
    let initialWidth;

    // Find the element by data attribute
    const cellElement: any = document.querySelector(`[data-cell-id="${index}"]`);

    if (!cellElement) {
      console.error('Cell element not found');
      return;
    }

    if (cell.width) {
      initialWidth = cell.width;
    } else {
      initialWidth = cellElement.offsetWidth;
    }

    const mouseMove = (moveEvent: MouseEvent) => {
      const offset = moveEvent.clientX - start;
      const newWidth = initialWidth + offset;
      cell.width = newWidth;
      cellElement.style.width = `${newWidth}px`;
    };

    const mouseUp = () => {
      const finalWidth = cell.width; // get the final width after resizing
      this.totalOverlayWidth += (finalWidth - initialWidth); // only change by the difference between final and initial width

      // Update the overlay container width
      const overlayContainer = document.querySelector('.fixed-columns-overlay');
      if (overlayContainer) {
        overlayContainer['style'].width = `${this.totalOverlayWidth}px`;
      }

      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
      this.isResizing = false;
    };

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  }

  getTableWidth() {
    let totalWidth = 0;
    const cells = this.elementRef.nativeElement.querySelectorAll('.cell-header');
    cells.forEach((cell: HTMLElement) => {
      totalWidth += cell.offsetWidth;
    });
    return totalWidth;
  }

  syncContainerWidths() {
    const tableWidth = this.getTableWidth();
    const elementsContainer = this.elementRef.nativeElement.querySelector('.elements-container');
    this.stretchLastColumnIfNeeded();
    if (elementsContainer) {
      this.renderer?.setStyle(elementsContainer, 'width', `${tableWidth}px`);
      this.syncCellWidths();
    }
  }

  syncCellWidths() {
    const headerCells = this.elementRef.nativeElement.querySelectorAll('.cell-header');

    const fetchedWidths = Array.from(headerCells).map((cell: HTMLElement) => cell.offsetWidth);

    this.dynamicService.setCellWidths(fetchedWidths);
  }

  doubleClick(element) {
    let button = null;
    this.settings.navbar.buttons.map(btn => {
      if (btn.default) {
        return button = btn;
      }
    });
    if (button) {
      this.dynamicService.handleButtonActions(button, element);
    }
  }


}
