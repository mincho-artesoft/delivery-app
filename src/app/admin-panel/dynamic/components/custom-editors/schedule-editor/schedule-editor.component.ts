import { Component, Input, OnInit } from '@angular/core';
import { BaseExtendedFormGroup } from '../../../extends/base-extended-form-group';

@Component({
  selector: 'app-schedule-editor',
  templateUrl: './schedule-editor.component.html',
  styleUrls: ['./schedule-editor.component.scss']
})
export class ScheduleEditorComponent implements OnInit {

  @Input('cell') cell: any;
  @Input('control') control: any;
  @Input('formGroup') formGroup: BaseExtendedFormGroup;
  localFormGroup: BaseExtendedFormGroup;

  ngOnInit(): void {
    this.localFormGroup = this.formGroup.get(this.cell.data) as BaseExtendedFormGroup;
  }


}
