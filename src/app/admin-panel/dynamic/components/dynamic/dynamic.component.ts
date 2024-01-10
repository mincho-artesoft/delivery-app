import { AfterViewInit, Component, Input, OnDestroy, OnInit, effect } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DynamicService } from '../../services/dynamic.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseExtendedFormGroup } from '../../extends/base-extended-form-group';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { BaseExtendedFormArray } from '../../extends/base-extended-form-array';



@Component({
  selector: 'app-dynamic',
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.scss']
})
export class DynamicComponent implements OnInit, OnDestroy {
  @Input('settings') settings: any;
  @Input('formGroup') formGroup!: BaseExtendedFormGroup;
  @Input('formArray') formArray!: BaseExtendedFormArray;
  id: any;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  addOnBlur = true;
  matChipList: any;
  constructor(
    private router: Router,
    private http: HttpClient,
    public dynamicService: DynamicService,
  ) { }

  ngOnInit(): void {
  }


  ngOnDestroy(): void {
    console.log('Dynamic component is destroyed!');
  }

  validateAndParseNumbers(columnSettings: any[], formGroup: FormGroup) {
    columnSettings.forEach(setting => {
      if (setting.validators && setting.validators.some((v: any) => v.name === 'number')) {
        if (formGroup.contains(setting.data)) {
          const value = formGroup.get(setting.data)?.value;
          if (value !== null && value !== undefined) {
            formGroup.get(setting.data)?.setValue(parseInt(value, 10));
          }
        }
      }
      if (setting.cells) {
        this.validateAndParseNumbers(setting.cells, formGroup);
      }
    });
  }


  getBaseExtendedFormGroup(parent: string, lang: string): BaseExtendedFormGroup {
    return this.formGroup.get(parent)?.get(lang) as BaseExtendedFormGroup;
  }


  toggleLang(lang: any, cell: any) {
    this.formGroup.toggleLang(lang)
  }


  trackByCountryCode(index: number, country: any): string {
    return country.code;
  }

  getColumns(column: any, lang: any) {
    let arr: any = []
    column.columns.map((cell: any) => {
      if (cell.data.indexOf(lang) > -1) {
        arr.push(cell)
      }
    })
    let returnValue = { ...column };
    returnValue.columns = arr
    return returnValue;
  }

  

  add(event: MatChipInputEvent, control): void {
    const input = event.input;
    const value = event.value;
    console.log(value);
    // Add chip
    if ((value || '').trim()) {
      let ctrlValue = control.value || [];
      ctrlValue.push(`#${value.trim()}`);
      control.patchValue(ctrlValue);
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }
  
  remove(chip: string, control): void {
    const ctrlValue = control.value || [];
    const index = ctrlValue.indexOf(chip);
  
    if (index >= 0) {
      ctrlValue.splice(index, 1);
      control.patchValue(ctrlValue);
    }
  }
  
  edit(chip: string, event: MatChipEditedEvent, control): void {
    const ctrlValue = control.value || [];
    const index = ctrlValue.indexOf(chip);
  
    if (index >= 0 && event.value.trim() !== '') {
      ctrlValue[index] = `#${event.value.trim()}`;
      control.patchValue(ctrlValue);
    }
  }
  
}
