import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';



@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {
  currentForm: any;
  validatorMapping: any = {
    'minLength': (arg: any) => Validators.minLength(arg),
    'maxLength': (arg: any) => Validators.maxLength(arg),
    'required': () => Validators.required,
    'email': () => Validators.email,
    'number': (arg: any) => Validators.pattern('^[0-9]*$'),
    'pattern': (arg: any) => Validators.pattern(arg)
  };


  constructor() { }


  createFormFromTemplate(formGroup: any, columns: any) {
    const controls: any[] = [];
    columns?.map((item: any) => {

      // Expansion template
      if (item.expansionTemplate) {
        item.columns.forEach((subItem: any) => {
          if (typeof subItem.data === 'object') {
            Object.keys(subItem.data).forEach(prop => {
              subItem.data[prop] = `${item.data}.${subItem.data[prop]}`;
              const newItem = { ...subItem, data: subItem.data[prop] };
              controls.push(newItem);
            });
          } else {
            if (!subItem.useOriginalData) {
              subItem.data = `${item.data}.${subItem.data}`;
            }
            controls.push(subItem);
          }
        });
      } else if (typeof item.data === 'string') {
        controls.push(item);
      } else if (typeof item.data === 'object') {
        Object.keys(item.data).map(prop => {
          const newControl = { ...item, data: item.data[prop] };
          controls.push(newControl);
        });
      }
    });
    formGroup = this.toFormGroup(controls, { formGroup });
    return formGroup;
  }

  toFormGroup(columns: any[], options?: { languageTemplate?: any, formGroup?: any, index?: any }) {
    const myForm = options?.formGroup ? options.formGroup : new FormGroup({});
    columns?.map(cell => {
      this.resolve(cell, myForm);
    });
    this.currentForm = myForm;
    return myForm;
  }

  resolve(cell: any, group: any, value = '', separator = '.') {
    let validators: ValidatorFn[] = [];

    if (cell.validators) {
      for (const validator of cell.validators) {
        const validatorFunction = this.validatorMapping[validator.name];
        if (validatorFunction) {
          validators.push(validatorFunction(validator.arg));
        }
      }
    }
    if (cell.data.indexOf(separator) > -1) {
      const properties = Array.isArray(cell.data) ? cell.data : cell.data.split(separator);
      return properties.reduce((prev: any, curr: any, index: any) => {
        if (!prev.get(curr)) {
          if (index === properties.length - 1) {
            const control = new FormControl({ value: value, disabled: cell.readOnly }, validators);
            prev.addControl(curr, control);
          } else {
            prev.addControl(curr, new FormGroup({}));
          }
        }
        return prev.get(curr);
      }, group);

    } else {
      let control;
      let controls = group.controls || group.control.controls;
      if (!controls.hasOwnProperty(cell.data)) {
        if (cell.formArray) {
          if (Array.isArray(cell.formArray)) {
            control = new FormArray([]);
            this.createFormFromTemplate(control, cell.formArray)
          } else {
            control = new FormArray([]);
          }
        } else {
          console.log(validators)
          control = new FormControl({ value: value, disabled: cell.readOnly }, validators);

        }
        group.addControl(cell.data, control);
      } else {
        control = controls[cell.data];
      }
      return control;
    }
  }

  fillFormWithResponseValues(formGroup: any, settings: any, response: any, dontRun?: boolean): any {
    if(settings.formArray && !dontRun){
      formGroup.addControl(settings.formArray, new FormGroup([]));
      const formArrayControl = formGroup.get(settings.formArray);
      if (formArrayControl instanceof FormGroup) {
        return this.fillFormWithResponseValues(formArrayControl, settings, response, true);
      } else {
        throw new Error(`Control ${settings.formArray} is not a FormGroup`);
      }
    }    
    
    this.deepResponseAsign(formGroup, response);
    formGroup.patchValue(response);
    Object.keys(response).map(key => {
      if (Array.isArray(response[key]) && formGroup.get(key) instanceof FormArray) {
        let currentFormArray = formGroup.get(key) as FormArray;
        const setting = settings.columns.filter(({ data }: any) => data === key)[0];
        if (setting) {
          if (!setting.keepArray) {
            currentFormArray.clear();
          }
          (response[key].length === 0 && setting.initDefault ? [{}] : response[key]).forEach((responseItem: any, index: any) => {
            let newFormGroup = this.toFormGroup([]);
            if (setting?.columns) {
              setting.arrayColumns.forEach((templateItem: any) => {
                let value = responseItem[templateItem.data];
                if (templateItem.data.split('.').length > 1) {
                  value = responseItem;
                  templateItem.data.split('.').forEach((el: any) => {
                    value = value ? value[el] : undefined;
                  });
                }

                this.applyCommonProps(templateItem, setting.arrayColumns);
                let formControl = this.resolve(templateItem, newFormGroup, value);
                formControl['currentIndex'] = index;
                formControl['manualChange'] = 'false';
              });
            }
            currentFormArray.push(newFormGroup);
          });
        }
      }
    });
  }

  applyCommonProps(item: any, settings: any) {
    if (settings.common) {
      let commonProps = settings.common;
      Object.keys(commonProps).forEach(commonKey => {
        if (!item.hasOwnProperty(commonKey)) {
          let commonProp = commonProps[commonKey];
          item[commonKey] = JSON.parse(JSON.stringify(commonProp).replace(/\*/g, item.data));
        }
      });
    }
  }

  deepResponseAsign(formGroup: FormGroup, response: any) {
    Object.keys(response).map(item => {
      if (this.isObject(response[item]) && !Array.isArray(response[item])) {
        let newFormGroup = formGroup.get(item) as FormGroup || new FormGroup({});
        formGroup.addControl(item, newFormGroup);
        this.deepResponseAsign(newFormGroup, response[item]);
      } else {
        if (typeof formGroup.getRawValue === 'function' && formGroup.addControl) {
          if (!formGroup.getRawValue().hasOwnProperty(item)) {
            formGroup.addControl(item, new FormControl());
          }
        }
      }
    });
  }

  isObject(o: any) {
    return o !== null && o !== undefined && typeof o === 'object';
  }
}
