import { FormArray } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { BaseExtendedFormGroup } from './base-extended-form-group';

export class BaseExtendedFormArray extends FormArray {
  htmlSettings: any = {}
  constructor(
    private settings: any,
    private http: HttpClient,
    private service: any,
    private collectedData?: any,
    private values?: any[]) {
    super([]);
    this.htmlSettings = settings;
    this.initArray();
    if (this.htmlSettings.linked) {
      this.controls.map((formGroup: BaseExtendedFormGroup) => {
        formGroup.linkWithExternalService(this.htmlSettings.linked)
      })
    }

  }

  private initArray() {
    if (this.values && this.values.length > 0) {
      for (const value of this.values) {
        this.push(new BaseExtendedFormGroup(this.settings.columns, this.http, this.service, this.collectedData, value));
      }
    } else {
      this.push(new BaseExtendedFormGroup(this.settings.columns, this.http, this.service, this.collectedData));
    }
  }

  fillFormWithResponse(data: any[]) {
    data.forEach((value, index) => {
      if (index < this.length) {
        (this.at(index) as BaseExtendedFormGroup).patchValue(value);
      } else {
        this.push(new BaseExtendedFormGroup(this.settings.columns, this.http, this.service, this.collectedData, value));
      }
    });

    while (this.length > data.length) {
      this.removeAt(this.length - 1);
    }
  }


}
