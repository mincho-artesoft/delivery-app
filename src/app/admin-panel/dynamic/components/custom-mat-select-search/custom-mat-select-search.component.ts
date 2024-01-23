import { HttpClient } from '@angular/common/http';
import { Component, forwardRef, Input, OnInit, OnDestroy, ChangeDetectorRef, signal, computed } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { BehaviorSubject, catchError, debounce, debounceTime, map, Observable, of, Subject, tap } from 'rxjs';
import { RendererFactory2 } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { ViewChild } from '@angular/core';
import { switchMap } from "rxjs";
import { fromObservable } from './from-observable';
import { fromSignal } from './from-signal';
import { DropdownControl } from '../../extends/dropdown-control';


@Component({
  selector: 'app-custom-mat-select-search',
  templateUrl: './custom-mat-select-search.component.html',
  styleUrls: ['./custom-mat-select-search.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomMatSelectSearchComponent),
      multi: true
    }
  ]
})
export class CustomMatSelectSearchComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input('cellControl') cellControl: DropdownControl;

  @ViewChild('matSelectElement', { static: false }) matSelect!: MatSelect;

  filterCtrl = new FormControl();
  selectedOptions: any[] = [];
  data = <any>[];
  renderer;
  isPending = false;
  lastPage = false;
  roleToInt: any;
  notifier = new Subject();

  searchControl = new FormControl('');




  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }



  public changeQuery(query: string): void {
    this.cellControl.search(query)
  }


  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300)
    ).subscribe((searchTerm) => {
      this.cellControl.search(searchTerm);
    });

  }

  writeValue(value: any): void {
    if (value) {
      this.selectedOptions = value;
      // this.cellControl.patchValue(value)
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    // Register the change function
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
    // Register the touched function
  }

  setDisabledState(isDisabled: boolean): void {
    // Set the disabled state of the component
  }


  // Additional methods to handle search, selection, and HTTP requests


  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  onSelectionChange(event: MatSelectChange): void {
    this.onChange(this.selectedOptions);
    this.onTouched();
  }



  onOpenedChange(opened: boolean): void {
    if (opened) {
      if (this.matSelect.panel) {
        const panel = this.matSelect.panel.nativeElement;
        this.renderer.listen(panel, 'scroll', (event) => {
          if (event.target.scrollHeight - (event.target.scrollTop + event.target.clientHeight) <= 150) {
            if (!this.cellControl.isPending && !this.lastPage) {
              this.cellControl.loadNextPage();
            }
          }
        });
      }
    }
  }

  removeOption(option: any) {
    const index = this.selectedOptions.indexOf(option);

    if (index >= 0) {
      this.selectedOptions.splice(index, 1);
    }
  }
  ngOnDestroy(): void {
    this.notifier.next(true);
    this.notifier.complete();
  }
}