import { Component, Input, OnInit } from '@angular/core';
import { BaseExtendedFormGroup } from '../../../extends/base-extended-form-group';
import { HttpClient } from '@angular/common/http';
import { DynamicService } from '../../../services/dynamic.service';
import { BaseExtendedFormArray } from '../../../extends/base-extended-form-array';

@Component({
  selector: 'app-input-editor',
  templateUrl: './input-editor.component.html',
  styleUrls: ['./input-editor.component.scss']
})
export class InputEditorComponent implements OnInit {
  @Input('formArray') formArray: any;
  @Input('column') column: any;
  localFormGroup: BaseExtendedFormGroup;
  constructor(private http: HttpClient,
    public dynamicService: DynamicService) {

  }

  ngOnInit(): void {
    this.formArray = (this.formArray.get(this.column.data) as BaseExtendedFormArray);
    this.localFormGroup = new BaseExtendedFormGroup(this.column, this.http, this.dynamicService);
    console.log(this.formArray)

  }

  addItem() {
    const arrayValues = this.formArray.value;

    const filteredArrayValues = arrayValues.filter(item => {
      return !Object.values(item).every(value => value === '' || value == null);
    });

    filteredArrayValues.unshift(this.localFormGroup.value);

    this.formArray.fillFormWithResponse(filteredArrayValues);
  }

}
