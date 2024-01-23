import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { BaseControl } from "./base-control";
import { DropdownControl } from "./dropdown-control";
import { HttpClient } from '@angular/common/http';
import { MultilangFormGroup } from "./multilang-formgroup";
import { LangControl } from "./lang-control";
import { BehaviorSubject, map } from "rxjs";
import { InterpolateService } from '../services/interpolate.service';
import { BaseExtendedFormArray } from "./base-extended-form-array";
export class BaseExtendedFormGroup extends FormGroup {
  resources: any = {};
  htmlSettings: any = {};
  service: any;
  externalServiceData: any;
  public activeLang: BehaviorSubject<string> | null = null;
  constructor(
    settings: any, private http: HttpClient, service: any, collectedData?: any, values?: any, isRoot?: boolean
  ) {
    let deepCopiedSettings;
    let rootLevel;
    if (isRoot) {
      rootLevel = JSON.parse(JSON.stringify(isRoot))
    }
    if (settings.columns) {
      deepCopiedSettings = JSON.parse(JSON.stringify(settings));
    }

    const columns = settings.columns ? JSON.parse(JSON.stringify(settings.columns)) : settings;
    const controls: { [key: string]: any } = {};

    const typeMapping: { [key: string]: any } = {
      'BaseExtendedFormGroup': BaseExtendedFormGroup,
      'BaseExtendedFormArray': BaseExtendedFormArray,
      'MultilangFormGroup': MultilangFormGroup,
      'FormGroup': FormGroup,
      'FormArray': FormArray,
      'BaseControl': BaseControl,
      'DropdownControl': DropdownControl,
      'LangControl': LangControl
    };
    for (let i = columns.length - 1; i >= 0; i--) {
      let cell = columns[i];
      if (cell.data.indexOf('.') === -1) {
        if (cell.controlType) {
          const passSettings = cell.controlType === 'BaseExtendedFormArray' ? cell : (cell.columns || cell);
          controls[cell.data] = new typeMapping[cell.controlType](passSettings, http, service, collectedData && Object.keys(collectedData).length > 0 ? collectedData : null);
        } else {
          controls[cell.data] = new BaseControl(cell, (cell.default || ''));
        }
      } else {
        let parent = cell.data.split('.')[0];
        let xColumns = [];
        for (let x = columns.length - 1; x >= 0; x--) {
          let xCell = JSON.parse(JSON.stringify(columns[x]));
          if (parent === xCell.data.split('.')[0]) {
            xCell.data = xCell.data.split('.').slice(1).join('.');
            xColumns.push(xCell);
          }
        }
        controls[parent] = new BaseExtendedFormGroup(xColumns, http, service);
      }

    }

    super(controls);
    this.service = service;
    columns.map((cell: any) => {
      if (cell.autopopulate) {
        this.findControlByPath(cell.data)?.setupAutopopulate(cell.autopopulate, this);
      }
      if (cell.autodisable) {
        this.findControlByPath(cell.data)?.setupAutoDisable(cell.autodisable, this);
      }
      if (cell.validators?.some((validator: any) => validator.name === 'asyncVal')) {
        this.findControlByPath(cell.data)?.setupValidator(cell.validators.find((validator: any) => validator.name === 'asyncVal').arg);
      }
    });
    if (values) {
      this.fillFormWithResponse(values)
    }
    if (collectedData) {
      this.resources = collectedData;
    }

    if (rootLevel) {
      this.activeLang = new BehaviorSubject<string>(this.resources.languages[0].code);
    }

    if (deepCopiedSettings) {
      this.attachControlReferences(deepCopiedSettings)
    }
  }

  findControlByPath(path: string): BaseControl | null {
    const keys = path.split('.');
    let control: any = this;
    for (const key of keys) {
      control = control.get(key);
      if (!control) return null;
    }
    return control instanceof BaseControl ? control : null;
  }

  fillFormWithResponse(data: any) {
    if (!data) {
      throw new Error('Data must be provided');
    }

    for (const key in data) {
      if (this.controls[key]) {
        if (this.controls[key] instanceof BaseExtendedFormGroup) {
          (this.controls[key] as BaseExtendedFormGroup).fillFormWithResponse(data[key]);
        } else if (this.controls[key] instanceof FormGroup || this.controls[key] instanceof FormArray) {
          this.controls[key].patchValue(data[key], { emitEvent: false });
        } else {
          this.controls[key].patchValue(data[key], { emitEvent: false });
        }
      } else {
        const control = new BaseControl({ data: key }, data[key]);
        this.addControl(key, control);
      }
    }
  }

  attachControlReferences(settings: any[]): any[] {
    const modifiedSettings = JSON.parse(JSON.stringify(settings));
    const attachControlToCell = (cell: any) => {
      const control = this.findControlByPath(cell.data);
      if (control) {
        cell.control = control;
      }
      if (Array.isArray(cell.columns)) {
        for (const nestedCell of cell.columns) {
          let copiedData = JSON.parse(JSON.stringify(nestedCell.data))
          nestedCell.data = `${cell.data}.${nestedCell.data}`
          attachControlToCell(nestedCell);
          nestedCell.data = copiedData;

        }
      }
    };

    for (const cell of modifiedSettings.columns) {
      attachControlToCell(cell);
    }

    return this.htmlSettings = modifiedSettings;
  }

  toggleLang(lang: any) {
    this.activeLang?.next(lang);
  }

  clearFormStates() {
    this.resources = {};
    this.htmlSettings = {};
    this.activeLang = null;
  }

  linkWithExternalService(data: any) {
    const path = InterpolateService.suplant(data.interpolate, this.service.interpolateData);
    this.http.request('Yget', path).pipe(map((res: any) => {
      const data = JSON.parse(res).structure || JSON.parse(res);
      this.externalServiceData = data;
    })).subscribe();
  }
}

