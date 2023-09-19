import { FormArray } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { BaseExtendedFormGroup } from './base-extended-form-group';

export class BaseExtendedFormArray extends FormArray {
  htmlSettings: any = {}
  constructor(
    private settings: any, 
    private http: HttpClient, 
    private collectedData?: any, 
    private values?: any[]) {
    super([]);
    this.initArray();
    this.htmlSettings = settings;
  }

  private initArray() {
    if (this.values && this.values.length > 0) {
      for (const value of this.values) {
        this.push(new BaseExtendedFormGroup(this.settings.columns, this.http, this.collectedData, value));
      }
    } else {
      this.push(new BaseExtendedFormGroup(this.settings.columns, this.http, this.collectedData));
    }
  }

  fillFormWithResponse(data: any[]) {
    this.clear();
    for (const value of data) {
      this.push(new BaseExtendedFormGroup(this.settings.columns, this.http, this.collectedData, value));
    }
  }

}
